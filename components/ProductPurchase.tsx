"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { productCanCheckout, productImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { QuantitySelect } from "@/components/QuantitySelect";
import { QuoteRequestModal } from "@/components/QuoteRequestModal";
import { WishlistButton } from "@/components/WishlistButton";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const cart = useCart();
  if (!productCanCheckout(product)) return <><div className="product-purchase-actions"><div className="product-buy"><button type="button" onClick={() => setQuoteOpen(true)}>{product.inventory.track_inventory && product.inventory.stock_status !== "in_stock" ? "Out of stock — contact us" : "Request a quote"}</button></div><WishlistButton productId={product.id}/></div><QuoteRequestModal product={product} open={quoteOpen} onClose={() => setQuoteOpen(false)}/></>;
  return <div className="product-purchase-actions"><div className="product-buy"><QuantitySelect value={quantity} onChange={setQuantity}/><button onClick={() => cart.add({ productId: product.id, slug: product.slug, title: product.title, price: product.price.amount!, image: productImage(product) || "" }, quantity)}>Add to cart</button></div><WishlistButton productId={product.id}/></div>;
}
