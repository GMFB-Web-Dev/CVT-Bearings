import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandMarquee, SearchPanel } from "@/components/SharedSections";

export const metadata: Metadata = { title: "General Information" };
const faqs = [
  ["How do I know which CVT bearing I need?", "Start with the transmission code, bearing number and accurate ID, OD and width measurements. If you are unsure, send clear photos and vehicle details to our team."],
  ["Can you help identify a bearing from a transmission code or vehicle model?", "Yes. A transmission code is normally more reliable than a vehicle model alone. Use our contact form and include every identifier you can find."],
  ["Are your bearings suitable for transmission rebuilds and repair work?", "Our range is intended for CVT repair and rebuild applications. Always verify dimensions and identifiers before installation."],
  ["What brands of bearings do you supply?", "Our catalogue includes NSK, NTN, KOYO, FAG, Timken and other application-specific manufacturers where known."],
  ["Can I order online directly through the website?", "Fixed-price, technically complete products can be added to cart. Products needing technical confirmation use a quote workflow."],
  ["What information should I send if I am unsure which part I need?", "Send your transmission code, vehicle year/make/model, existing part numbers, dimensions and clear photos."],
];
export default function HelpPage() {
  const cards = [
    ["/assets/help-shipping.svg", "Shipping & Returns", "/shipping-returns"],
    ["/assets/help-orders.svg", "Orders & Payments", "/orders-payments"],
    ["/assets/help-store.svg", "Product & Store", "/bearings"],
    ["/assets/help-about.svg", "About us", "/about"],
    ["/assets/help-contact.svg", "Contact Us", "/contact"],
    ["/assets/help-login.svg", "Log in / Sign up", "/login-sign-up"],
  ] as const;

  return <div className="help-page">
    <section className="content-section help-content">
      <h1>How can <em>we help?</em></h1>
      <div className="help-grid">{cards.map(([icon, label, href]) => <Link key={label} href={href}><Image src={icon} width={202} height={87} alt=""/><h3>{label}</h3></Link>)}</div>
      <div className="faq section"><h2>FAQs</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <BrandMarquee/>
    <SearchPanel/>
  </div>;
}
