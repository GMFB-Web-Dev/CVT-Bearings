import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogBanner, ContactSection, PromoCards, ServiceStrip } from "@/components/SharedSections";
import { assetURL, entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About CVT Bearings | CVT Bearings & Transmission Parts NZ",
  description: "Learn about CVT Bearings and our focus on supplying CVT bearings and transmission parts across New Zealand for workshops, mechanics and vehicle repair needs.",
  path: "/about-us",
  keywords: ["About CVT Bearings", "CVT Bearings NZ", "CVT Transmission Parts NZ"],
  image: "/assets/about-hero.jpg",
  imageTitle: "About CVT Bearings and CVT transmission parts supply in New Zealand",
  imageAlt: "About CVT Bearings, supplying CVT bearings and transmission parts for workshops and vehicle repairs across New Zealand",
});

export default async function AboutPage() {
  const page = await getPage("/about");
  const content = section(page, "app/about/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const features = [
    [c("copy-015", "Specialist CVT Knowledge"), c("copy-016", "CVTs are our speciality. We understand the different transmission types, bearing applications and part requirements, helping you narrow down the right product and order with greater confidence.")],
    [c("copy-017", "Honest, Practical Advice"), c("copy-018", "Not sure what you need? We provide clear, straightforward guidance without unnecessary upselling, helping you understand your options and choose the bearing that matches your requirements.")],
    [c("copy-019", "Quality Parts & Kits"), c("copy-020", "Our range includes CVT bearings and bearing kits for major transmission applications. We focus on dependable products that workshops, rebuilders and vehicle owners can confidently use.")],
    [c("copy-021", "Nationwide Parts Supply"), c("copy-022", "Get the bearings you need wherever you are in New Zealand. With nationwide shipping available, we make it straightforward for workshops, rebuilders and vehicle owners to access our CVT bearing range.")],
  ];
  return <div className="about-page">
    <section className="inner-hero about-hero"><div><h1>{c("copy-002", "About Us")}</h1><p>{c("copy-003", "New Zealand-owned with 50+ years of automotive experience behind every CVT bearing we supply.")}</p><Link className="button" href={c("copy-004", "/bearings")}>{c("copy-005", "Find your bearing")}</Link></div></section>
    <ServiceStrip/>
    <section className="content-section split about-built"><div><h2>{c("copy-006", "Built on CVT")} <em>{c("copy-007", "experience")}</em></h2><p>{c("copy-008", "CVT Bearings is part of a New Zealand-owned group with more than 50 years of automotive experience.")}</p><p>{c("copy-009", "At CVT Bearings, we focus on supplying quality CVT bearings and related parts with honest advice and practical support.")}</p><p>{c("copy-010", "Backed by hands-on industry knowledge, we believe in clear communication, fair pricing and dependable support.")}</p></div><Image src={assetURL(page, "assets/facility.png", "/assets/facility.png")} width={1672} height={941} alt={c("copy-011", "CVT New Zealand workshop in Tirau")}/></section>
    <section className="why-section"><div className="page-width"><h2>{c("copy-012", "Why")} <em>{c("copy-013", "choose us")}</em></h2><p className="why-intro">{c("copy-014", "Finding the right CVT bearing shouldn't be complicated.")}</p><div className="why-grid">{features.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <PromoCards/><BlogBanner/><ContactSection/>
  </div>;
}
