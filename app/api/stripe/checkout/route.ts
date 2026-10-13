import type Stripe from "stripe";
import { productCanCheckout, SITE_KEY } from "@/lib/catalog";
import { getProductsUncached } from "@/lib/catalog-data";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, getStripe, STRIPE_INTEGRATION_IDENTIFIER } from "@/lib/stripe";

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
  const gstTaxRateId = process.env.STRIPE_NZ_GST_TAX_RATE_ID;
  if (!gstTaxRateId) {
    return jsonError("Checkout tax configuration is not complete yet. Please contact CVT Bearings.", 503);
  }
  const shippingRateId = process.env.STRIPE_NZ_SHIPPING_RATE_ID;
  if (!shippingRateId) {
    return jsonError("Checkout delivery configuration is not complete yet. Please contact CVT Bearings.", 503);
  }

  let stripe: ReturnType<typeof getStripe>;
  let admin: ReturnType<typeof createAdminClient>;
  try {
    stripe = getStripe();
    admin = createAdminClient();
  } catch (error) {
    console.error("Stripe checkout configuration error", error);
    return jsonError("Secure checkout is not configured yet. Please contact CVT Bearings.", 503);
  }

  const subtotal = lines.reduce((sum, line) => sum + line.product!.price.amount! * line.quantity, 0);
  const { data: order, error: orderError } = await admin.from("orders").insert({
    site_key: SITE_KEY,
    user_id: user.id,
    status: "draft",
    subtotal_nzd: subtotal,
    total_nzd: subtotal,
  }).select("id").single();

  if (orderError || !order) {
    console.error("Stripe checkout order creation failed", orderError);
    return jsonError("We could not prepare your order. Please try again.", 500);
  }

  const { error: itemError } = await admin.from("order_items").insert(lines.map(({ product, quantity }) => ({
    site_key: SITE_KEY,
    order_id: order.id,
    product_id: product!.id,
    product_title: product!.title,
    sku: product!.sku,
    quantity,
    unit_price_nzd: product!.price.amount,
  })));

  if (itemError) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id).eq("site_key", SITE_KEY);
    console.error("Stripe checkout order items failed", itemError);
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
      client_reference_id: order.id,
      customer_email: user.email,
      customer_creation: "always",
      line_items: lineItems,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["NZ"] },
      shipping_options: [{ shipping_rate: shippingRateId }],
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        shipping_address: { message: "Enter the New Zealand delivery address for this order." },
        submit: { message: "Your payment is processed securely by Stripe." },
      },
      metadata: { order_id: order.id, user_id: user.id, site_key: SITE_KEY },
      payment_intent_data: { metadata: { order_id: order.id, user_id: user.id, site_key: SITE_KEY } },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?checkout=cancelled`,
      submit_type: "pay",
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    await admin.from("orders").update({ stripe_checkout_session_id: session.id, status: "pending" }).eq("id", order.id).eq("site_key", SITE_KEY);
    return Response.json({ url: session.url });
  } catch (error) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id).eq("site_key", SITE_KEY);
    console.error("Stripe Checkout Session creation failed", error);
    return jsonError("Stripe could not start checkout. Please try again.", 502);
  }
}
