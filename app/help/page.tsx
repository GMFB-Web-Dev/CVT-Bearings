import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, MessagesCircle, Store, Truck, UserRound, WalletCards, type LucideIcon } from "lucide-react";
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
  const cards: Array<[LucideIcon, string, string]> = [
    [Truck, "Shipping & Returns", "/shipping-returns"],
    [WalletCards, "Orders & Payments", "/orders-payments"],
    [Store, "Product & Store", "/bearings"],
    [CircleHelp, "About us", "/about"],
    [MessagesCircle, "Contact Us", "/contact"],
    [UserRound, "Log in / Sign up", "/login-sign-up"],
  ];

  return <div className="help-page">
    <section className="content-section help-content">
      <h1>How can <em>we help?</em></h1>
      <div className="help-grid">{cards.map(([Icon, label, href]) => <Link key={label} href={href}><Icon aria-hidden="true"/><h3>{label}</h3></Link>)}</div>
      <div className="faq section"><h2>FAQs</h2>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <BrandMarquee/>
    <SearchPanel/>
  </div>;
}
