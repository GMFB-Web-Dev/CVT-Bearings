"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { money } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

export function CartDrawer() {
  const { lines, total, open, setOpen, update, remove } = useCart();
  return <div className={open ? "cart-overlay open" : "cart-overlay"} onClick={() => setOpen(false)}>
    <aside onClick={(event) => event.stopPropagation()}>
      <div className="cart-title"><h3>Your cart</h3><button onClick={() => setOpen(false)}><X/></button></div>
      {!lines.length ? <div className="empty-cart"><ShoppingBag size={56}/><h4>Your cart is empty</h4><Link href="/bearings" onClick={() => setOpen(false)} className="button">Shop bearings</Link></div> : <>
        <div className="cart-lines">{lines.map((line) => <article key={line.productId}>
          {line.image ? <Image src={line.image} width={86} height={86} style={{ width: 86, height: "auto" }} alt=""/> : <div className="cart-line-placeholder">No image</div>}
          <div><Link href={`/products/${line.slug}`} onClick={() => setOpen(false)}>{line.title}</Link><strong>{money(line.price * line.quantity)}</strong><div className="qty"><button onClick={() => update(line.productId, line.quantity - 1)}><Minus size={13}/></button><span>{line.quantity}</span><button onClick={() => update(line.productId, line.quantity + 1)}><Plus size={13}/></button></div></div>
          <button className="remove" onClick={() => remove(line.productId)}>Remove</button>
        </article>)}</div>
        <div className="cart-summary"><p><span>Subtotal</span><strong>{money(total)}</strong></p><small>Shipping and GST are calculated at checkout.</small><Link className="button wide" href="/cart" onClick={() => setOpen(false)}>View cart</Link></div>
      </>}
    </aside>
  </div>;
}
