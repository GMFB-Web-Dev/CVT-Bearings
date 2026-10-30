import type { Metadata } from "next";
import Link from "next/link";
import { BlogBanner, ContactSection, ServiceStrip } from "@/components/SharedSections";
import { entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Orders & Payments | CVT Bearings NZ",
  description: "View order and payment information for CVT Bearings. Find details on buying CVT bearings and transmission parts, payment options and order support in New Zealand.",
  path: "/orders-and-payments",
  keywords: ["CVT Bearings Orders", "CVT Bearings Payments", "CVT Bearings NZ"],
  image: "/assets/transmission.jpg",
  imageTitle: "CVT Bearings order and payment information for New Zealand customers",
  imageAlt: "Orders and payments page for CVT Bearings, supplying CVT bearings and transmission parts across New Zealand",
});
function Table({ rows }: { rows: string[][] }) { return <table className="info-table"><tbody>{rows.map(([q, a]) => <tr key={q}><th>{q}</th><td>{a}</td></tr>)}</tbody></table>; }

export default async function OrdersPage() {
  const page = await getPage("/orders-payments");
  const content = section(page, "app/orders-payments/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const orders = [
    ["Can I order online directly through the website?", "Yes, you can place orders directly through the website using the online store, cart, and checkout system. The site also includes account login and sign-up features for customers."],
    ["Do I need an account to place an order?", "You can create an account through the website, which makes it easier to manage your details and orders. The site clearly offers login and sign-up options for customers."],
    ["Can I save products for later?", "Yes, the website includes a wish-list feature so you can save products for later review before placing your order."],
    ["Can I buy gift certificates?", "Yes, gift certificates are available through the online store."],
    ["What if I am unsure which part I need before ordering?", "Check the product details carefully and use your transmission code, vehicle model, and any existing part numbers where possible. If you are still unsure, contact the team before ordering so they can help point you towards the right part."],
    ["Can I change or cancel my order after placing it?", "Please contact the team as soon as possible if you need to change or cancel an order."],
    ["How will I know if my order has gone through?", "Once your order is completed through the checkout, it should appear as a confirmed online purchase."],
    ["Is there a minimum order quantity?", "Some products show a minimum purchase quantity of one unit on the product page."],
  ];
  const payments = [
    ["What currency are prices shown in?", "The website lists product prices in New Zealand dollars, shown as NZ$."],
    ["Are prices shown clearly before I pay?", "Yes, product pages display pricing before checkout, and freight is then added automatically during the checkout process before payment is finalised."],
    ["What payment methods do you accept?", "We accept a range of payment options through the website, including Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, Amazon Pay, and Afterpay."],
    ["Do you offer trade or bulk pricing?", "Bulk pricing is available on selected products. Where available, quantity-based pricing will be shown on the product page. For larger orders or trade enquiries, please contact our team."],
    ["Can I request a quote before paying?", "For specialised parts, larger orders, or if you are unsure about fitment, it makes sense to contact the team first."],
    ["Is GST included in the pricing?", "Yes, all prices shown on the website include GST."],
    ["Who do I contact about an order or payment issue?", "For help with orders or payment-related questions, contact the team using info@cvt.co.nz +64 7 883 1134, or 0800 288 695."],
  ];
  return <><section className="inner-hero orders-hero orders-payments-hero"><div><h1>{c("copy-032", "Orders & Payments")}</h1><p>{c("copy-033", "Find the key information for placing an order and paying through the CVT Bearings website.")}</p><Link className="button" href={c("copy-034", "/bearings")}>{c("copy-035", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section orders-payments-content"><h2>Orders</h2><p>Order your CVT bearings directly through our online store. Browse by transmission, save products for later and contact our team if you need help identifying the right part before placing your order.</p><Table rows={orders}/><h2 style={{ marginTop: 50 }}>Payments</h2><p>Pay securely online in New Zealand dollars using a range of payment options. All listed prices include GST, with shipping costs shown at checkout before your order is finalised.</p><Table rows={payments}/></section><BlogBanner/><ContactSection/></>;
}
