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
  const shipping = [
    ["How much does shipping cost?", "Shipping costs are calculated automatically at checkout based on your order and delivery address."],
    ["Do you ship throughout New Zealand?", "Yes, we ship parts throughout New Zealand, with freight costs varying depending on the item and destination."],
    ["Do you ship internationally?", "Yes, international shipping is available on selected items. If you would like a freight quote for an order outside New Zealand, contact our team before ordering."],
    ["How do I track my order?", "Once your order has been packed and sent, tracking details can be provided so you can follow the delivery progress. If you have not received tracking information, contact our team for help."],
    ["How long will delivery take?", "Delivery times can vary depending on your location and the parts ordered. Rural addresses, large freight items, and international deliveries may take longer than standard shipments."],
    ["Who do I contact about shipping?", "For help with shipping, delivery, or tracking, contact CVT Parts Ltd at info@cvt.co.nz +64 7 883 1134, or 0800 288 695."],
  ];
  const returns = [
    ["Can I return a part if I ordered the wrong item?", "Most new, unopened items may be returned within 14 days of delivery for a full refund. Return shipping costs are normally the customer's responsibility unless the return is due to an error on our side."],
    ["What if I receive the wrong part or a faulty item?", "If the item is incorrect or defective, customers should send photos of the issue. Once the part has been returned, the correct part can be sent or a refund issued, including original freight charges where applicable."],
    ["Are all parts eligible for return?", "No. If the part is not faulty and the order was not sent in error, returns are only accepted where the item meets the stated unopened return conditions."],
    ["How long does a refund take?", "Refunds can take up to 3 weeks in total, although many are processed sooner. This includes return transit time, processing time once the item is received, and the time taken by the bank to complete the refund."],
    ["What should I do before returning an item?", "Please contact the team first and provide your order details, along with photos if the item is faulty or incorrect, so the return can be assessed properly."],
    ["Who do I contact about returns?", "For returns support, contact CVT Parts Ltd by email at info@cvt.co.nz or by phone on +64 7 883 1134 or 0800 288 695."],
  ];
  return <><section className="inner-hero shipping-hero shipping-returns-hero"><div><h1>{c("copy-026", "Shipping & Returns")}</h1><p>{c("copy-027", "Need help with shipping or returns? Here is everything you need to know before and after placing your order.")}</p><Link className="button" href={c("copy-028", "/bearings")}>{c("copy-029", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section shipping-returns-content"><h2>Shipping</h2><p>We offer shipping throughout New Zealand, with international delivery available on selected items. Shipping costs are calculated at checkout based on your order and delivery location.</p><Table rows={shipping}/><h2 style={{ marginTop: 50 }}>Returns</h2><p>We accept returns on eligible new and unopened items within 14 days of delivery. If you receive an incorrect or faulty item, contact our team so we can help arrange the return, replacement or refund.</p><Table rows={returns}/></section><BlogBanner/><ContactSection/></>;
}
