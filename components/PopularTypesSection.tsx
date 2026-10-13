import Link from "next/link";
import { PopularTypesTabs } from "@/components/PopularTypesTabs";
import { productSection, type Product, type ProductSection } from "@/lib/catalog";

const popularTypes: Array<{ id: ProductSection; label: string }> = [
  { id: "main-bearing-kits", label: "Main bearing kits" },
  { id: "pulley-bearings", label: "Pulley bearings" },
  { id: "primary-pulley-bearings", label: "Primary pulley bearings" },
];

export function PopularTypesSection({
  excludeProductId = "",
  activeSection = "main-bearing-kits",
  products,
}: {
  excludeProductId?: string;
  activeSection?: ProductSection;
  products: Product[];
}) {
  const categories = popularTypes.map((type) => ({
    ...type,
    products: products
      .filter((product) =>
        product.commerce.mode === "fixed_price"
        && product.id !== excludeProductId
        && productSection(product) === type.id)
      .slice(0, 10),
  }));

  return <section className="popular-types">
    <div className="page-width">
      <h2>Shop by popular <em>bearing types</em></h2>
      <PopularTypesTabs categories={categories} initialSection={activeSection}/>
      <div className="popular-types-catalogue-link">
        <Link className="button catalogue-button" href="/bearings">View full catalogue</Link>
      </div>
    </div>
  </section>;
}
