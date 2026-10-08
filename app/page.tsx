import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { BlogBanner, BrandMarquee, ContactSection, PromoCards, SearchPanel, ServiceStrip } from "@/components/SharedSections";
import { AutoCarousel } from "@/components/AutoCarousel";
import { PopularTypesSection } from "@/components/PopularTypesSection";
import { products } from "@/lib/catalog";

export default function Home() {
  const fixed = products.filter((product) => product.commerce.mode === "fixed_price");
  const mostPopular = [fixed[0], fixed[3], fixed[11], fixed[12], fixed[13], fixed[16]].filter(Boolean);

  return <>
    <section className="hero"><div className="hero-content"><h1>CVT Bearings NZ</h1><p>Reduce Wear with High Performance CVT Bearings</p><Link href="/bearings" className="button">Find your bearing</Link></div></section>
    <ServiceStrip/>
    <section className="home-showcase">
      <div className="white-section section home-shop-section"><div className="page-width"><h2>Shop CVT <em>bearings</em></h2><AutoCarousel className="product-carousel five-up" label="CVT bearing products" desktopVisible={5} tabletVisible={2}>{fixed.slice(0,10).map((product) => <ProductCard key={product.id} product={product}/>)}</AutoCarousel></div></div>
      <PromoCards/>
    </section>
    <PopularTypesSection/>
    <BrandMarquee/>
    <SearchPanel/>
    <section className="white-section section most-popular-section"><div className="page-width"><h2 style={{textAlign:"center"}}>Most <em>popular</em></h2><AutoCarousel className="product-carousel three-up" label="Most popular products" desktopVisible={3} tabletVisible={2}>{mostPopular.map((product) => <ProductCard key={product.id} product={product}/>)}</AutoCarousel></div></section>
    <BlogBanner/>
    <ContactSection/>
  </>;
}
