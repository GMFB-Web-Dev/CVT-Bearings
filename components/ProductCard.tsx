"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { money, productImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const canBuy = product.commerce.mode === "fixed_price" && product.price.amount != null;
  const image = productImage(product);
  return <article className="product-card">
    <Link className="product-image" style={{ position: "relative" }} href={`/products/${product.slug}`}>{image ? <Image src={image} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 25vw" alt={product.images[0]?.alt || product.title}/> : <span className="product-image-placeholder">Image coming soon</span>}</Link>
    <div className="product-card-body">
      <Link href={`/products/${product.slug}`}>{product.title}</Link>
      <strong>{money(product.price.amount)}</strong>
      <div className="product-actions">
        {canBuy && <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Quantity">{[1,2,3,4,5].map((n) => <option key={n}>{n}</option>)}</select>}
        {canBuy ? <button onClick={() => cart.add({ productId: product.id, slug: product.slug, title: product.title, price: product.price.amount!, image: image || "" }, quantity)}>Add to cart</button> : <Link href={`/contact?product=${product.id}`}>Get a quote</Link>}
      </div>
    </div>
  </article>;
}
