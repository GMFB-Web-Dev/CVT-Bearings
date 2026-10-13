import type Stripe from "stripe";
import { SITE_KEY } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

function dollars(cents: number | null | undefined) {
  return Math.max(0, cents || 0) / 100;
}

async function markPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId || session.metadata?.site_key !== SITE_KEY || session.payment_status === "unpaid") return;
  if (session.amount_total == null) throw new Error("Paid Checkout Session is missing amount_total.");

  const admin = createAdminClient();
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = shipping ? { name: shipping.name, address: shipping.address } : null;

  const { error } = await admin.from("orders").update({
    status: "paid",
    subtotal_nzd: dollars(session.amount_subtotal),
    shipping_nzd: dollars(session.total_details?.amount_shipping),
    tax_nzd: dollars(session.total_details?.amount_tax),
    total_nzd: dollars(session.amount_total),
    shipping_address: shippingAddress,
    customer_email: session.customer_details?.email || session.customer_email,
    stripe_payment_intent_id: paymentIntentId || null,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", orderId).eq("site_key", SITE_KEY).neq("status", "cancelled");

  if (error) throw error;

  const userId = session.metadata?.user_id;
  if (userId) {
    const { error: cartError } = await admin.from("carts").update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("site_key", SITE_KEY).eq("user_id", userId).eq("status", "active");
    if (cartError) throw cartError;
  }
}

async function markFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId || session.metadata?.site_key !== SITE_KEY) return;
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId).eq("site_key", SITE_KEY).in("status", ["draft", "pending"]);
  if (error) throw error;
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
