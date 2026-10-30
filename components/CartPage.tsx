"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { money } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

export function CartPage({ checkoutCancelled = false }: { checkoutCancelled?: boolean }) {
  const { lines, total, update, remove } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: lines.map(({ productId, quantity }) => ({ productId, quantity })) }),
      });
      const result = await response.json() as { url?: string; error?: string; code?: string };
      if (response.status === 401 || result.code === "AUTH_REQUIRED") {
        router.push("/login-sign-up?next=%2Fcart");
        return;
      }
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout could not be started.");
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  if (!lines.length) return <div className="page-width cart-empty-page"><h1>Your cart</h1><p>Your cart is empty.</p><Link className="button" href="/bearings">Shop bearings</Link></div>;

  return <div className="page-width">
    <h1>Your cart</h1>
    {checkoutCancelled && <p className="notice">Checkout was cancelled. Your cart is still here.</p>}
    <div className="cart-layout">
      <div className="cart-items" aria-label="Cart items">
        <table className="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th/></tr></thead><tbody>
          {lines.map((line) => <tr key={line.productId}>
            <td><div className="cart-product">{line.image ? <Image src={line.image} width={90} height={90} alt=""/> : <span className="cart-line-placeholder">No image</span>}<Link href={`/products/${line.slug}`}>{line.title}</Link></div></td>
            <td className="cart-price">{money(line.price)}</td>
            <td><div className="cart-quantity"><button type="button" onClick={() => update(line.productId, line.quantity - 1)} aria-label={`Decrease ${line.title} quantity`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => update(line.productId, line.quantity + 1)} aria-label={`Increase ${line.title} quantity`}>+</button></div></td>
            <td className="cart-price">{money(line.quantity * line.price)}</td>
            <td><button className="cart-remove" onClick={() => remove(line.productId)}>Remove</button></td>
          </tr>)}
        </tbody></table>
      </div>
      <aside className="cart-totals">
        <h2>Cart totals</h2>
        <p className="cart-subtotal"><span>Subtotal</span><b>{money(total)}</b></p>
        <small>Prices include GST. Delivery and the GST portion are shown in secure checkout before you pay.</small>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button wide checkout-button" onClick={checkout} disabled={loading}><LockKeyhole size={17}/>{loading ? "Opening secure checkout…" : "Secure checkout"}</button>
        <small className="stripe-note">Payments are processed securely by Stripe.</small>
      </aside>
    </div>
  </div>;
}
