import Link from "next/link";
import { AutoCarousel } from "@/components/AutoCarousel";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/catalog";

export function PopularTypesSection({ excludeProductId = "" }: { excludeProductId?: string }) {
  const featured = products
    .filter((product) => product.commerce.mode === "fixed_price" && product.id !== excludeProductId)
    .slice(5, 15);

  return <section className="popular-types">
    <div className="page-width">
      <h2>Shop by popular <em>bearing types</em></h2>
      <div className="type-tabs">
        <Link href="/bearings/main-bearing-kits">Main bearing kits</Link>
        <Link href="/bearings/pulley-bearings">Pulley bearings</Link>
        <Link href="/bearings/primary-pulley-bearings">Primary pulley bearings</Link>
      </div>
      <AutoCarousel className="product-carousel five-up" label="Popular bearing types" desktopVisible={5} tabletVisible={2}>
        {featured.map((product) => <ProductCard key={product.id} product={product}/>) }
      </AutoCarousel>
    </div>
  </section>;
}
