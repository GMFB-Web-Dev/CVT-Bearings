import type Stripe from "stripe";
import { SITE_KEY } from "@/lib/catalog";
import { cancelStorefrontCheckoutOrder, completeStorefrontCheckoutOrder } from "@/lib/storefront-orders";
import { getStripe } from "@/lib/stripe";

function dollars(cents: number | null | undefined) {
  return Math.max(0, cents || 0) / 100;
}

async function markPaid(session: Stripe.Checkout.Session) {
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
}

async function markFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId || session.metadata?.site_key !== SITE_KEY) return;
  await cancelStorefrontCheckoutOrder(orderId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return new Response("Webhook is not configured.", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return new Response("Invalid signature.", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await markPaid(event.data.object);
    } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      await markFailed(event.data.object);
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", { eventId: event.id, type: event.type, error });
    return new Response("Webhook processing failed.", { status: 500 });
  }

  return Response.json({ received: true });
}
