import type { Metadata } from "next";
import { CartPage } from "@/components/CartPage";

export const metadata: Metadata = { title: "Cart" };

export default async function Page({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  return <section className="cart-page"><CartPage checkoutCancelled={checkout === "cancelled"}/></section>;
}
