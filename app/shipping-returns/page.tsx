import type { Metadata } from "next";
import Link from "next/link";
import { BlogBanner, ContactSection, ServiceStrip } from "@/components/SharedSections";
import { entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Shipping & Returns | CVT Bearings NZ",
  description: "View shipping and returns information for CVT Bearings. Find details on CVT bearing orders, transmission parts supply and support across New Zealand.",
  path: "/shipping-and-returns",
  keywords: ["CVT Bearings Shipping", "CVT Bearings Returns", "CVT Bearings NZ"],
  image: "/assets/shipping-hero.jpg",
  imageTitle: "CVT Bearings shipping and returns information for New Zealand customers",
  imageAlt: "Shipping and returns information for CVT Bearings, supplying CVT bearings and transmission parts across New Zealand",
});
function Table({ rows }: { rows: string[][] }) { return <table className="info-table"><tbody>{rows.map(([q, a]) => <tr key={q}><th>{q}</th><td>{a}</td></tr>)}</tbody></table>; }

export default async function ShippingPage() {
  const page = await getPage("/shipping-returns");
  const content = section(page, "app/shipping-returns/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const shipping = Array.from({ length: 6 }, (_, index) => [c(`copy-${String(index * 2 + 2).padStart(3, "0")}`, "Shipping question"), c(`copy-${String(index * 2 + 3).padStart(3, "0")}`, "Contact our team for shipping information.")]);
  const returns = Array.from({ length: 6 }, (_, index) => [c(`copy-${String(index * 2 + 14).padStart(3, "0")}`, "Returns question"), c(`copy-${String(index * 2 + 15).padStart(3, "0")}`, "Contact our team before returning an item.")]);
  return <><section className="inner-hero shipping-hero"><div><h1>{c("copy-026", "Shipping & Returns")}</h1><p>{c("copy-027", "Need help with shipping or returns? Here is everything you need to know before and after placing your order.")}</p><Link className="button" href={c("copy-028", "/bearings")}>{c("copy-029", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section"><h2>{c("copy-030", "Shipping")}</h2><p>{c("copy-031", "We offer shipping throughout New Zealand, with international delivery available on selected items.")}</p><Table rows={shipping}/><h2 style={{ marginTop: 50 }}>{c("copy-032", "Returns")}</h2><p>{c("copy-033", "We accept returns on eligible new and unopened items within 14 days of delivery.")}</p><Table rows={returns}/></section><BlogBanner/><ContactSection/></>;
}
