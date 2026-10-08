"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { productImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1); const cart = useCart();
  if (product.commerce.mode !== "fixed_price" || product.price.amount == null) return <div className="product-buy"><Link href={`/contact?product=${product.id}`}>Get a quote</Link></div>;
  return <div className="product-buy"><input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}/><button onClick={() => cart.add({ productId: product.id, slug: product.slug, title: product.title, price: product.price.amount!, image: productImage(product) || "" }, quantity)}>Add to cart</button></div>;
}
