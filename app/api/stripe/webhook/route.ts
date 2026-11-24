import type Stripe from "stripe";
import { SITE_KEY } from "@/lib/catalog";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { cancelStorefrontCheckoutOrder, completeStorefrontCheckoutOrder } from "@/lib/storefront-orders";
import { constructStripeWebhookEvent, getSiteUrl, getStripeConfig } from "@/lib/stripe";

function dollars(cents: number | null | undefined) {
  return Math.max(0, cents || 0) / 100;
}

function addressLines(shipping: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null | undefined) {
  if (!shipping) return [];
  const address = shipping.address;
  return [
    shipping.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(" "),
    address.country === "NZ" ? "New Zealand" : address.country,
  ].filter((line): line is string => Boolean(line));
}

async function markPaid(stripe: Stripe, session: Stripe.Checkout.Session, siteUrl: string) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId || session.metadata?.site_key !== SITE_KEY || session.payment_status === "unpaid") return;
  if (session.amount_total == null) throw new Error("Paid Checkout Session is missing amount_total.");

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = shipping ? { name: shipping.name, address: shipping.address } : null;

  const completed = await completeStorefrontCheckoutOrder({
    orderId,
    subtotalNzd: dollars(session.amount_subtotal),
    shippingNzd: dollars(session.total_details?.amount_shipping),
    taxNzd: dollars(session.total_details?.amount_tax),
    totalNzd: dollars(session.amount_total),
    shippingAddress,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    paymentIntentId: paymentIntentId || null,
  });
  if (!completed) throw new Error("The paid Checkout Session did not match an active order.");

  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) throw new Error("Paid Checkout Session is missing the customer email.");

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  const items = lineItems.data.map((line) => {
    const quantity = Math.max(1, line.quantity || 1);
    const product = line.price?.product;
    const sku = product && typeof product === "object" && !product.deleted ? product.metadata.sku : undefined;
    const lineTotalNzd = dollars(line.amount_total);
    return {
      title: line.description || "CVT bearing",
      sku: sku || undefined,
      quantity,
      unitPriceNzd: dollars(line.amount_subtotal) / quantity,
      lineTotalNzd,
    };
  });

  await sendOrderConfirmationEmail(orderId, customerEmail, {
    orderNumber: orderId.slice(0, 8).toUpperCase(),
    customerName: shipping?.name || session.customer_details?.name || customerEmail.split("@")[0],
    orderDate: new Intl.DateTimeFormat("en-NZ", { day: "numeric", month: "long", year: "numeric", timeZone: "Pacific/Auckland" }).format(new Date(session.created * 1000)),
    items,
    subtotalNzd: dollars(session.amount_subtotal),
    shippingNzd: dollars(session.total_details?.amount_shipping),
    taxNzd: dollars(session.total_details?.amount_tax),
    totalNzd: dollars(session.amount_total),
    shippingAddress: addressLines(shipping),
    orderUrl: `${siteUrl}/account#orders`,
  });
}

async function markFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId || session.metadata?.site_key !== SITE_KEY) return;
  await cancelStorefrontCheckoutOrder(orderId);
}

function verifyWebhook(body: string, signature: string) {
  const config = getStripeConfig();
  try {
    return constructStripeWebhookEvent(body, signature, config);
  } catch (error) {
    if (!config.managedLive) throw error;
    // Sandbox sessions opened before the account switch can finish with their original signer.
    return constructStripeWebhookEvent(body, signature, getStripeConfig(true));
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature.", { status: 400 });

  let verified: ReturnType<typeof verifyWebhook>;
  try {
    verified = verifyWebhook(await request.text(), signature);
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  const { event, stripe } = verified;
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await markPaid(stripe, event.data.object, getSiteUrl(request));
    } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      await markFailed(event.data.object);
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", { eventId: event.id, type: event.type, error });
    return new Response("Webhook processing failed.", { status: 500 });
  }

  return Response.json({ received: true });
}
