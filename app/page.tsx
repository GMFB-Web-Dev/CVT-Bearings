import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { BlogBanner, BrandMarquee, ContactSection, PromoCards, SearchPanel, ServiceStrip } from "@/components/SharedSections";
import { AutoCarousel } from "@/components/AutoCarousel";
import { PopularTypesSection } from "@/components/PopularTypesSection";
import { getProducts } from "@/lib/catalog-data";
import { entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "CVT Bearings | CVT Bearings & Transmission Parts NZ",
  description: "CVT Bearings supplies CVT bearings and transmission parts across New Zealand, helping workshops and vehicle owners find the right parts for CVT repair and servicing.",
  path: "/home",
  keywords: ["CVT Bearings NZ", "CVT Transmission Parts NZ", "CVT Parts NZ"],
  image: "/assets/hero.jpg",
  imageTitle: "CVT Bearings and CVT transmission parts supplied across New Zealand",
  imageAlt: "CVT bearings and transmission parts supplied by CVT Bearings for workshops and vehicle repairs across New Zealand",
});

export default async function Home() {
  const [products, page] = await Promise.all([getProducts(), getPage("/")]);
  const content = section(page, "app/page.tsx");
  const fixed = products.filter((product) => product.commerce.mode === "fixed_price");
  const mostPopular = [fixed[0], fixed[3], fixed[11], fixed[12], fixed[13], fixed[16]].filter(Boolean);

  return <>
    <section className="hero"><div className="hero-content"><h1>{entry(content, "copy-001", "CVT Bearings NZ")}</h1><p>{entry(content, "copy-002", "Reduce Wear with High Performance CVT Bearings")}</p><Link href={entry(content, "copy-003", "/bearings")} className="button">{entry(content, "copy-004", "Find your bearing")}</Link></div></section>
    <ServiceStrip/>
    <section className="home-showcase">
      <div className="white-section section home-shop-section"><div className="page-width"><h2>Shop CVT <em>bearings</em></h2><AutoCarousel className="product-carousel five-up" label="CVT bearing products" desktopVisible={5} tabletVisible={2}>{fixed.slice(0,10).map((product) => <ProductCard key={product.id} product={product}/>)}</AutoCarousel></div></div>
      <PromoCards/>
    </section>
    <PopularTypesSection products={products}/>
    <BrandMarquee/>
    <SearchPanel products={products}/>
    <section className="white-section section most-popular-section"><div className="page-width"><h2 style={{textAlign:"center"}}>{entry(content, "copy-007", "Most")} <em>{entry(content, "copy-008", "popular")}</em></h2><AutoCarousel className="product-carousel three-up" label="Most popular products" desktopVisible={3} tabletVisible={2}>{mostPopular.map((product) => <ProductCard key={product.id} product={product}/>)}</AutoCarousel></div></section>
    <BlogBanner/>
    <ContactSection/>
  </>;
}
