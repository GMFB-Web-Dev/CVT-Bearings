"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { productImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { QuantitySelect } from "@/components/QuantitySelect";
import { QuoteRequestModal } from "@/components/QuoteRequestModal";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const cart = useCart();
  if (product.commerce.mode !== "fixed_price" || product.price.amount == null) return <><div className="product-buy"><button type="button" onClick={() => setQuoteOpen(true)}>Request a quote</button></div><QuoteRequestModal product={product} open={quoteOpen} onClose={() => setQuoteOpen(false)}/></>;
  return <div className="product-buy"><QuantitySelect value={quantity} onChange={setQuantity}/><button onClick={() => cart.add({ productId: product.id, slug: product.slug, title: product.title, price: product.price.amount!, image: productImage(product) || "" }, quantity)}>Add to cart</button></div>;
}
