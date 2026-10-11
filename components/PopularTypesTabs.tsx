"use client";

import { useState } from "react";
import { AutoCarousel } from "@/components/AutoCarousel";
import { ProductCard } from "@/components/ProductCard";
import type { Product, ProductSection } from "@/lib/catalog";

type PopularCategory = {
  id: ProductSection;
  label: string;
  products: Product[];
};

export function PopularTypesTabs({
  categories,
  initialSection,
}: {
  categories: PopularCategory[];
  initialSection: ProductSection;
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const activeCategory = categories.find((category) => category.id === activeSection) ?? categories[0];

  if (!activeCategory) return null;

  return <>
    <div className="type-tabs" role="tablist" aria-label="Popular bearing types">
      {categories.map((category) => <button
        key={category.id}
        id={`popular-type-tab-${category.id}`}
        className={activeCategory.id === category.id ? "active" : ""}
        type="button"
        role="tab"
        aria-selected={activeCategory.id === category.id}
        aria-controls="popular-type-panel"
        onClick={() => setActiveSection(category.id)}
      >{category.label}</button>)}
    </div>
    <div
      id="popular-type-panel"
      role="tabpanel"
      aria-labelledby={`popular-type-tab-${activeCategory.id}`}
    >
      <AutoCarousel
        key={activeCategory.id}
        className="product-carousel five-up"
        label={`Popular ${activeCategory.label}`}
        desktopVisible={5}
        tabletVisible={2}
      >
        {activeCategory.products.map((product) => <ProductCard key={product.id} product={product}/>)}
      </AutoCarousel>
    </div>
  </>;
}
