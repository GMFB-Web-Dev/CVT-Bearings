import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandMarquee, SearchPanel } from "@/components/SharedSections";
import { getProducts } from "@/lib/catalog-data";
import { entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "General Info | CVT Bearings NZ",
  description: "Find contact details and general information for CVT Bearings. Get help with CVT bearings, transmission parts, product enquiries and NZ-wide supply.",
  path: "/general-info",
  keywords: ["CVT Bearings Contact", "CVT Bearings NZ", "CVT Transmission Parts NZ"],
  image: "/assets/transmission.jpg",
  imageTitle: "CVT Bearings contact and general information for New Zealand customers",
  imageAlt: "Contact and general information page for CVT Bearings, supplying CVT bearings and transmission parts across New Zealand",
});

export default async function HelpPage() {
  const [page, products] = await Promise.all([getPage("/help"), getProducts()]);
  const content = section(page, "app/help/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const faqs = [
    [c("copy-002", "How do I know which CVT bearing I need?"), c("copy-003", "Start with the transmission code, bearing number and accurate measurements.")],
    [c("copy-004", "Can you help identify a bearing from a transmission code or vehicle model?"), c("copy-005", "Yes. Use our contact form and include every identifier you can find.")],
    [c("copy-006", "Are your bearings suitable for transmission rebuilds and repair work?"), c("copy-007", "Our range is intended for CVT repair and rebuild applications.")],
    [c("copy-008", "What brands of bearings do you supply?"), c("copy-009", "Our catalogue includes major application-specific manufacturers where known.")],
    [c("copy-010", "Can I order online directly through the website?"), c("copy-011", "Fixed-price products can be added to cart; products needing confirmation use a quote workflow.")],
    [c("copy-012", "What information should I send if I am unsure which part I need?"), c("copy-013", "Send your transmission code, vehicle details, part numbers, dimensions and photos.")],
  ];
  const cards: Array<[string, string, string]> = [
    ["/assets/help-shipping.svg", c("copy-014", "Shipping & Returns"), "/shipping-and-returns"], ["/assets/help-orders.svg", c("copy-015", "Orders & Payments"), "/orders-and-payments"],
    ["/assets/help-store.svg", c("copy-016", "Product & Store"), "/bearings"], ["/assets/help-about.svg", c("copy-017", "About us"), "/about-us"],
    ["/assets/help-contact.svg", c("copy-018", "Contact Us"), "/contact"], ["/assets/help-login.svg", c("copy-019", "Log in / Sign up"), "/login-sign-up"],
  ];
  return <div className="help-page"><section className="content-section help-content"><h1>{c("copy-020", "How can")} <em>{c("copy-021", "we help?")}</em></h1><div className="help-grid">{cards.map(([icon, label, href]) => <Link key={label} href={href}><Image src={icon} width={92} height={92} alt="" aria-hidden="true"/><h3>{label}</h3></Link>)}</div><div className="faq section"><h2>{c("copy-022", "FAQs")}</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section><BrandMarquee/><SearchPanel products={products}/></div>;
}
