import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata = { title: "Payment received" };

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  let paid = false;
  let orderReference = "";

  if (sessionId?.startsWith("cs_") && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      orderReference = session.metadata?.order_id?.slice(0, 8).toUpperCase() || "";
    } catch (error) {
      console.error("Stripe success page lookup failed", error);
    }
  }

  return <section className="checkout-result"><div className="checkout-result-card">
    <span className="checkout-result-icon" aria-hidden="true">{paid ? "✓" : "…"}</span>
    <h1>{paid ? "Payment received" : "Payment processing"}</h1>
    <p>{paid ? "Thank you. Stripe has confirmed your payment and CVT Bearings will prepare your order." : "Stripe is still confirming the payment. Your order will update automatically when confirmation arrives."}</p>
    {orderReference && <p className="order-reference">Order reference <strong>#{orderReference}</strong></p>}
    <div className="checkout-result-actions"><Link className="button" href="/account">View my orders</Link><Link href="/bearings">Continue shopping</Link></div>
  </div></section>;
}
