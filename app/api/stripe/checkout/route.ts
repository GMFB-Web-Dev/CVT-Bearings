import type Stripe from "stripe";
import { productCanCheckout, SITE_KEY } from "@/lib/catalog";
import { getProductsUncached } from "@/lib/catalog-data";
import {
  attachStorefrontCheckoutSession,
  cancelStorefrontCheckoutOrder,
  createStorefrontCheckoutOrder,
} from "@/lib/storefront-orders";
import { createClient } from "@/lib/supabase/server";
import { getNzGstTaxRateId, getSiteUrl, getStripe, STRIPE_INTEGRATION_IDENTIFIER } from "@/lib/stripe";

type IncomingLine = { productId?: unknown; quantity?: unknown };

function jsonError(error: string, status: number, code?: string) {
  return Response.json({ error, code }, { status });
}

function parseLines(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) return null;
  const combined = new Map<string, number>();

  for (const valueLine of value as IncomingLine[]) {
    const productId = typeof valueLine.productId === "string" ? valueLine.productId : "";
    const quantity = Number(valueLine.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;
    combined.set(productId, (combined.get(productId) || 0) + quantity);
  }

  if ([...combined.values()].some((quantity) => quantity > 20)) return null;
  return [...combined].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function POST(request: Request) {
  let body: { items?: unknown };
  try {
    body = await request.json() as { items?: unknown };
  } catch {
    return jsonError("The cart could not be read.", 400);
  }

  const incoming = parseLines(body.items);
  if (!incoming) return jsonError("Your cart contains an invalid item or quantity.", 400);

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return jsonError("Sign in before continuing to secure checkout.", 401, "AUTH_REQUIRED");
  }

  let products;
  try {
    products = await getProductsUncached();
  } catch (error) {
    console.error("Live product validation failed", error);
    return jsonError("We could not verify current prices and stock. Please try again.", 503);
  }
  const catalogueById = new Map(products.map((product) => [product.id, product]));
  const lines = incoming.map((line) => ({ ...line, product: catalogueById.get(line.productId) }));

  if (lines.some((line) => !line.product)) return jsonError("A product in your cart is no longer available.", 409);
  if (lines.some(({ product }) => !productCanCheckout(product!))) {
    return jsonError("A product is quote-only, out of stock, or no longer available. Remove it or request a quote.", 409);
  }
  let stripe: ReturnType<typeof getStripe>;
  let gstTaxRateId: string;
  try {
    stripe = getStripe();
    gstTaxRateId = await getNzGstTaxRateId(stripe);
  } catch (error) {
    console.error("Stripe checkout configuration error", error);
    return jsonError("Secure checkout is not configured yet. Please contact CVT Bearings.", 503);
  }

  const shippingRateId = process.env.STRIPE_NZ_SHIPPING_RATE_ID?.trim();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  const isStripeTestMode = /^(?:sk|rk)_test_/.test(stripeSecretKey);
  if (!shippingRateId && !isStripeTestMode) {
    return jsonError("Checkout delivery configuration is not complete yet. Please contact CVT Bearings.", 503);
  }

  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = shippingRateId
    ? [{ shipping_rate: shippingRateId }]
    : [{
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "nzd" },
          display_name: "Sandbox test delivery",
          tax_behavior: "inclusive",
        },
      }];

  let orderId: string;
  try {
    orderId = await createStorefrontCheckoutOrder(user.id, lines.map(({ product, quantity }) => ({
      product_id: product!.id,
      product_title: product!.title,
      sku: product!.sku || null,
      quantity,
      unit_price_nzd: product!.price.amount!,
    })));
  } catch (error) {
    console.error("Stripe checkout order creation failed", error);
    return jsonError("We could not prepare your order. Please try again.", 500);
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map(({ product, quantity }) => ({
    quantity,
    price_data: {
      currency: "nzd",
      unit_amount: Math.round(product!.price.amount! * 100),
      product_data: {
        name: product!.title,
        description: [product!.sku && `SKU ${product!.sku}`, product!.manufacturer].filter(Boolean).join(" · ") || undefined,
        metadata: { product_id: product!.id, slug: product!.slug },
      },
    },
    // Catalogue prices already include GST. Stripe's configured inclusive tax
    // rate itemises the GST portion without increasing the displayed price.
    tax_rates: [gstTaxRateId],
  }));

  const siteUrl = getSiteUrl(request);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: STRIPE_INTEGRATION_IDENTIFIER,
      client_reference_id: orderId,
      customer_email: user.email,
      customer_creation: "always",
      line_items: lineItems,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["NZ"] },
      shipping_options: shippingOptions,
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        shipping_address: { message: "Enter the New Zealand delivery address for this order." },
        submit: { message: "Your payment is processed securely by Stripe." },
      },
      metadata: { order_id: orderId, user_id: user.id, site_key: SITE_KEY },
      payment_intent_data: { metadata: { order_id: orderId, user_id: user.id, site_key: SITE_KEY } },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?checkout=cancelled`,
      submit_type: "pay",
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    const attached = await attachStorefrontCheckoutSession(orderId, session.id);
    if (!attached) {
      await stripe.checkout.sessions.expire(session.id);
      throw new Error("The Checkout Session could not be attached to its order.");
    }
    return Response.json({ url: session.url });
  } catch (error) {
    try {
      await cancelStorefrontCheckoutOrder(orderId);
    } catch (cancelError) {
      console.error("Failed to cancel the incomplete checkout order", cancelError);
    }
    console.error("Stripe Checkout Session creation failed", error);
    return jsonError("Stripe could not start checkout. Please try again.", 502);
  }
}
