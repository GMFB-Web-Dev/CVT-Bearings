import Link from "next/link";
import { AutoCarousel } from "@/components/AutoCarousel";
import { ProductCard } from "@/components/ProductCard";
import { products, type ProductSection } from "@/lib/catalog";

export function PopularTypesSection({
  excludeProductId = "",
  activeSection = "main-bearing-kits",
}: {
  excludeProductId?: string;
  activeSection?: ProductSection;
}) {
  const featured = products
    .filter((product) => product.commerce.mode === "fixed_price" && product.id !== excludeProductId)
    .slice(5, 15);

  return <section className="popular-types">
    <div className="page-width">
      <h2>Shop by popular <em>bearing types</em></h2>
      <div className="type-tabs">
        <Link className={activeSection === "main-bearing-kits" ? "active" : ""} aria-current={activeSection === "main-bearing-kits" ? "page" : undefined} href="/bearings/main-bearing-kits">Main bearing kits</Link>
        <Link className={activeSection === "pulley-bearings" ? "active" : ""} aria-current={activeSection === "pulley-bearings" ? "page" : undefined} href="/bearings/pulley-bearings">Pulley bearings</Link>
        <Link className={activeSection === "primary-pulley-bearings" ? "active" : ""} aria-current={activeSection === "primary-pulley-bearings" ? "page" : undefined} href="/bearings/primary-pulley-bearings">Primary pulley bearings</Link>
      </div>
      <AutoCarousel className="product-carousel five-up" label="Popular bearing types" desktopVisible={5} tabletVisible={2}>
        {featured.map((product) => <ProductCard key={product.id} product={product}/>) }
      </AutoCarousel>
    </div>
  </section>;
}
