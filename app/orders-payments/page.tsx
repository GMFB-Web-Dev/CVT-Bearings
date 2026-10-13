import type { Metadata } from "next";
import Link from "next/link";
import { BlogBanner, ContactSection, ServiceStrip } from "@/components/SharedSections";
import { entry, getPage, section } from "@/lib/cms";

export const metadata: Metadata = { title: "Orders & Payments" };
function Table({ rows }: { rows: string[][] }) { return <table className="info-table"><tbody>{rows.map(([q, a]) => <tr key={q}><th>{q}</th><td>{a}</td></tr>)}</tbody></table>; }

export default async function OrdersPage() {
  const page = await getPage("/orders-payments");
  const content = section(page, "app/orders-payments/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const rows = (start: number, count: number) => Array.from({ length: count }, (_, index) => [c(`copy-${String(start + index * 2).padStart(3, "0")}`, "Order question"), c(`copy-${String(start + index * 2 + 1).padStart(3, "0")}`, "Contact our team for more information.")]);
  return <><section className="inner-hero orders-hero"><div><h1>{c("copy-032", "Orders & Payments")}</h1><p>{c("copy-033", "Find the key information for placing an order and paying through the CVT Bearings website.")}</p><Link className="button" href={c("copy-034", "/bearings")}>{c("copy-035", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section"><h2>{c("copy-036", "Orders")}</h2><Table rows={rows(2, 8)}/><h2 style={{ marginTop: 50 }}>{c("copy-037", "Payments")}</h2><p>{c("copy-038", "Eligible fixed-price products use Stripe's hosted checkout. Payment details are entered on Stripe and are not stored by this website.")}</p><Table rows={rows(18, 7)}/></section><BlogBanner/><ContactSection/></>;
}
