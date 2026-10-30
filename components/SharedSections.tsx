"use client";

import Link from "next/link";
import Image from "next/image";
import { Headphones, Wrench, Truck, Globe2, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { AutoCarousel } from "@/components/AutoCarousel";
import { BearingFinder } from "@/components/BearingFinder";
import type { Product } from "@/lib/catalog";
import { useCms } from "@/components/CmsProvider";

function useSharedCms() {
  const cms = useCms();
  return { ...cms, c: (key: string, fallback: string) => cms.copy("components/SharedSections.tsx", key, fallback) };
}

export function ServiceStrip() {
  const { c } = useSharedCms();
  return <div className="service-strip"><div><Headphones/>{c("copy-001", "Rapid Customer")}<br/>{c("copy-002", "Service")}</div><div><Globe2/>{c("copy-003", "Global Shipping")}<br/>{c("copy-004", "Available")}</div><div><Wrench/>{c("copy-005", "CVT Repairs")}<br/>{c("copy-006", "Available")}</div><div><Truck/>{c("copy-007", "Shipping Across New")}<br/>{c("copy-008", "Zealand")}</div></div>;
}

export function BrandMarquee() {
  const { c, asset } = useSharedCms();
  const brands = [
    { src: asset("assets/brand-nsk.png", "/assets/brand-nsk.png"), alt: "NSK", width: 150, height: 69 },
    { src: asset("assets/brand-ntn.png", "/assets/brand-ntn.png"), alt: "NTN", width: 122, height: 56 },
    { src: asset("assets/brand-timken.png", "/assets/brand-timken.png"), alt: "Timken", width: 169, height: 78 },
    { src: asset("assets/brand-koyo.png", "/assets/brand-koyo.png"), alt: "Koyo", width: 171, height: 78 },
    { src: asset("assets/brand-fag.png", "/assets/brand-fag.png"), alt: "FAG", width: 174, height: 80 },
  ];
  const repeatedBrands = [...brands, ...brands];

  return <div className="brand-marquee" aria-label={c("copy-009", "Bearing brands")}>
    <div className="brand-track">
      {[0, 1].map((group) => <div className="brand-group" aria-hidden={group === 1} key={group}>
        {repeatedBrands.map((brand, index) => <Image className="brand-logo" src={brand.src} width={brand.width} height={brand.height} alt={group === 0 && index < brands.length ? brand.alt : ""} key={`${group}-${brand.alt}-${index}`}/>) }
      </div>)}
    </div>
  </div>;
}

export function PromoCards() {
  const { c, asset } = useSharedCms();
  const cards = [
    [asset("assets/promo-bulk-purchases.png", "/assets/promo-bulk-purchases.png"), c("copy-010", "Bulk Purchases"), c("copy-011", "Better pricing for larger orders"), "/contact?service=bulk", c("copy-012", "Bulk order")],
    [asset("assets/promo-cvt-blogs.png", "/assets/promo-cvt-blogs.png"), c("copy-013", "CVT Blogs"), c("copy-014", "Practical guides, tips and bearing insights"), "/blogs", c("copy-015", "Read blogs")],
    [asset("assets/promo-cvt-nz.png", "/assets/promo-cvt-nz.png"), c("copy-016", "CVT New Zealand"), c("copy-017", "Trusted CVT information and expert advice"), "https://cvt.co.nz/", c("copy-018", "Visit CVT NZ")],
    [asset("assets/promo-diagnostic-tool.png", "/assets/promo-diagnostic-tool.png"), c("copy-019", "Free CVT Diagnostic Tool"), c("copy-020", "Select your vehicle and symptoms for a fixed quote"), "https://cvt.co.nz/cvt-symptom-diagnostic-tool/", c("copy-021", "Try it now")],
    [asset("assets/promo-signup.png", "/assets/promo-signup.png"), c("copy-022", "Sign Up & Save"), c("copy-023", "Get 10% off your first CVT Bearings order"), "/login-sign-up", c("copy-024", "Sign up now")],
  ];
  const pageSize = 3;
  const pageCount = Math.ceil(cards.length / pageSize);
  const carouselCards = Array.from({ length: pageCount * pageSize }, (_, index) => cards[index % cards.length]);
  return <section className="promo-section section"><div className="page-width"><AutoCarousel className="promo-carousel" label="Promotions" desktopVisible={pageSize} tabletVisible={2} fixedPageSize={pageSize} interval={5500}>{carouselCards.map(([image, title, body, href, action], index) => <article className="promo-card" key={`${title}-${index}`}><Image src={image} width={1254} height={1254} sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" alt={title}/><div><span><b>{title}</b><small>{body}</small></span><Link href={href}>{action}</Link></div></article>)}</AutoCarousel></div></section>;
}

export function SearchPanel({ products = [] }: { products?: Product[] }) {
  const { c } = useSharedCms();
  const vehicleBrands = [...new Set(products.flatMap((product) => product.applications.vehicle_brands))].sort();
  const bearingTypes = [
    { value: "ball", label: c("copy-025", "Ball bearing") },
    { value: "roller", label: c("copy-026", "Roller bearing") },
    { value: "tapered roller", label: c("copy-027", "Tapered roller") },
    { value: "needle", label: c("copy-028", "Needle bearing") },
    { value: "thrust", label: c("copy-029", "Thrust bearing") },
    { value: "pulley", label: c("copy-030", "Pulley bearing") },
    { value: "kit", label: c("copy-031", "Bearing kit") },
  ];
  return <BearingFinder vehicleBrands={vehicleBrands} bearingTypes={bearingTypes}/>;
}

export function BlogBanner() {
  const { c } = useSharedCms();
  return <section className="blog-banner"><div><h2>{c("copy-032", "CVT bearing")} <em>{c("copy-033", "blogs")}</em></h2><p>{c("copy-034", "Explore practical guides, product information and useful tips to help you better understand CVT bearings and make more informed choices.")}</p></div><div><Link href={c("copy-035", "/blogs")}>{c("copy-036", "Explore our blogs")}</Link><Link href={c("copy-037", "/bearings")}>{c("copy-038", "Shop bearings")}</Link></div></section>;
}

export function ContactIntro({ detailsOnly = false }: { detailsOnly?: boolean }) {
  const { c, settings } = useSharedCms();
  return <section className={`contact-intro section${detailsOnly ? " contact-intro--details-only" : ""}`}><div className="page-width">{!detailsOnly && <><h2>{c("copy-039", "Contact")} <em>{c("copy-040", "us")}</em></h2><p>{c("copy-041", "Have a question about CVT bearings, bulk orders or finding the right product? Get in touch with our team and we'll help point you in the right direction.")}</p></>}<div className="contact-cards"><div><Mail/><h3>{c("copy-042", "Email")}</h3><a href={`mailto:${settings?.contact?.email || "info@cvt.co.nz"}`}>{settings?.contact?.email || c("copy-044", "info@cvt.co.nz")}</a></div><div><Phone/><h3>{c("copy-045", "Phone")}</h3><a href={settings?.contact?.phoneHref || c("copy-046", "tel:0800288695")}>{settings?.contact?.phoneDisplay || c("copy-047", "0800 288 695")}</a></div><div><MapPin/><h3>{c("copy-048", "Office")}</h3><a href={settings?.contact?.mapLink || c("copy-049", "https://maps.google.com/?q=125+State+Highway+5+Tirau")}>{settings?.contact?.area || c("copy-050", "125 State Highway 5, RD2, Tirau, 3485, New Zealand")}</a></div></div></div></section>;
}

export function ContactSection({ productId = "", contactPage = false }: { productId?: string; contactPage?: boolean }) {
  const { c, settings } = useSharedCms();
  return <div className={`contact-block${contactPage ? " contact-page-block" : ""}`}><ContactIntro detailsOnly={contactPage}/><section id="contact-form" className="home-contact-form"><div className="page-width contact-form-layout"><ContactForm productId={productId}/><iframe className="map-image" title={c("copy-051", "CVT New Zealand at 125 State Highway 5, Tirau")} src={settings?.contact?.mapEmbedURL || "https://www.google.com/maps?q=CVT+New+Zealand+Ltd,+125+State+Highway+5,+Tirau+3485,+New+Zealand&output=embed"} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></section></div>;
}
