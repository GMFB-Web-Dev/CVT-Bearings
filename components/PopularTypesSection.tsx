"use client";

import Link from "next/link";
import { PopularTypesTabs } from "@/components/PopularTypesTabs";
import { productSection, type Product, type ProductSection } from "@/lib/catalog";
import { useCms } from "@/components/CmsProvider";

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
  const { copy } = useCms();
  const c = (key: string, fallback: string) => copy("components/PopularTypesSection.tsx", key, fallback);
  const cmsTypes: Array<{ id: ProductSection; label: string }> = popularTypes.map((type, index) => ({ ...type, label: c(`copy-${String(index + 1).padStart(3, "0")}`, type.label) }));
  const categories = cmsTypes.map((type) => ({
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
      <h2>{c("copy-004", "Shop by popular")} <em>{c("copy-005", "bearing types")}</em></h2>
      <PopularTypesTabs categories={categories} initialSection={activeSection}/>
      <div className="popular-types-catalogue-link">
        <Link className="button catalogue-button" href={c("copy-006", "/bearings")}>{c("copy-007", "View full catalogue")}</Link>
      </div>
    </div>
  </section>;
}
