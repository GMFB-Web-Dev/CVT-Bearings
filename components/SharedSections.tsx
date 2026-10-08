import Link from "next/link";
import Image from "next/image";
import { Headphones, Wrench, Truck, Globe2, Mail, MapPin, Phone, Search } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { AutoCarousel } from "@/components/AutoCarousel";

export function ServiceStrip() {
  return <div className="service-strip"><div><Headphones/>Rapid Customer<br/>Service</div><div><Globe2/>Global Shipping<br/>Available</div><div><Wrench/>CVT Repairs<br/>Available</div><div><Truck/>Shipping Across New<br/>Zealand</div></div>;
}

export function BrandMarquee() {
  const brands = [
    { src: "/assets/brand-nsk.png", alt: "NSK", width: 150, height: 69 },
    { src: "/assets/brand-ntn.png", alt: "NTN", width: 122, height: 56 },
    { src: "/assets/brand-timken.png", alt: "Timken", width: 169, height: 78 },
    { src: "/assets/brand-koyo.png", alt: "Koyo", width: 171, height: 78 },
    { src: "/assets/brand-fag.png", alt: "FAG", width: 174, height: 80 },
  ];
  const repeatedBrands = [...brands, ...brands];

  return <div className="brand-marquee" aria-label="Bearing brands">
    <div className="brand-track">
      {[0, 1].map((group) => <div className="brand-group" aria-hidden={group === 1} key={group}>
        {repeatedBrands.map((brand, index) => <Image className="brand-logo" src={brand.src} width={brand.width} height={brand.height} alt={group === 0 && index < brands.length ? brand.alt : ""} key={`${group}-${brand.alt}-${index}`}/>) }
      </div>)}
    </div>
  </div>;
}

export function PromoCards() {
  const cards = [
    ["/assets/promo-bulk-purchases.png", "Bulk Purchases", "Better pricing for larger orders", "/contact?service=bulk", "Bulk order"],
    ["/assets/promo-cvt-blogs.png", "CVT Blogs", "Practical guides, tips and bearing insights", "/blogs", "Read blogs"],
    ["/assets/promo-cvt-nz.png", "CVT New Zealand", "Trusted CVT information and expert advice", "https://cvt.co.nz/", "Visit CVT NZ"],
    ["/assets/promo-diagnostic-tool.png", "Free CVT Diagnostic Tool", "Select your vehicle and symptoms for a fixed quote", "https://cvt.co.nz/cvt-symptom-diagnostic-tool/", "Try it now"],
    ["/assets/promo-signup.png", "Sign Up & Save", "Get 10% off your first CVT Bearings order", "/login-sign-up", "Sign up now"],
  ];
  const carouselCards = Array.from({ length: cards.length }, (_, page) =>
    Array.from({ length: 3 }, (_, position) => cards[(page + position) % cards.length]),
  ).flat();
  return <section className="promo-section section"><div className="page-width"><AutoCarousel className="promo-carousel" label="Promotions" desktopVisible={3} tabletVisible={2} fixedPageSize={3} interval={5500}>{carouselCards.map(([image, title, body, href, action], index) => <article className="promo-card" key={`${title}-${index}`}><Image src={image} width={1254} height={1254} sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" alt={title}/><div><span><b>{title}</b><small>{body}</small></span><Link href={href}>{action}</Link></div></article>)}</AutoCarousel></div></section>;
}

export function SearchPanel() {
  return <section className="find-panel"><div className="find-box"><h2>Find the right <em>bearing for you</em></h2><form action="/bearings"><label>Search for anything</label><div className="find-search"><input name="q" placeholder={'Search "Nissan", "24x7", or "Pulley Bearings" etc.'}/><button aria-label="Search"><Search size={18}/></button></div><label>Search by specifics</label><div className="specifics"><select name="brand"><option value="">Brand</option><option>Nissan</option><option>Toyota</option><option>Honda</option><option>Audi</option></select><label className="dimension-search"><input name="dimension" placeholder="Dimensions e.g. 24x7"/><Search size={16}/></label><select name="type"><option value="">Bearing Type</option><option>Ball</option><option>Roller</option><option>Pulley</option></select></div><button className="dark-button">Search by filter</button></form></div></section>;
}

export function BlogBanner() {
  return <section className="blog-banner"><div><h2>CVT bearing <em>blogs</em></h2><p>Explore practical guides, product information and useful tips to help you better understand CVT bearings and make more informed choices.</p></div><div><Link href="/blogs">Explore our blogs</Link><Link href="/bearings">Shop bearings</Link></div></section>;
}

export function ContactIntro() {
  return <section className="contact-intro section"><div className="page-width"><h2>Contact <em>us</em></h2><p>Have a question about CVT bearings, bulk orders or finding the right product? Get in touch with our team and we&apos;ll help point you in the right direction.</p><div className="contact-cards"><div><Mail/><h3>Email</h3><a href="mailto:info@cvt.co.nz">info@cvt.co.nz</a></div><div><Phone/><h3>Phone</h3><a href="tel:0800288695">0800 288 695</a></div><div><MapPin/><h3>Office</h3><a href="https://maps.google.com/?q=125+State+Highway+5+Tirau">125 State Highway 5, RD2, Tirau, 3485, New Zealand</a></div></div></div></section>;
}

export function ContactSection({ productId = "" }: { productId?: string }) {
  return <div className="contact-block"><ContactIntro/><section id="contact-form" className="home-contact-form"><div className="page-width contact-form-layout"><ContactForm productId={productId}/><Image className="map-image" src="/assets/map.png" width={1730} height={1076} loading="eager" alt="Map showing CVT New Zealand near Tirau"/></div></section></div>;
}
