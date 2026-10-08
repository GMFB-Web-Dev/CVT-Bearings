"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

function unique(values: (string | null)[]) {
  return [...new Set(values.filter(Boolean) as string[])].sort();
}

export function Catalogue({ initialProducts, initialQuery = "" }: { initialProducts: Product[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const manufacturers = unique(initialProducts.map((product) => product.manufacturer));
  const bearingTypes = unique(initialProducts.map((product) => product.bearing_type));
  const vehicleBrands = unique(initialProducts.flatMap((product) => product.applications.vehicle_brands));
  const toggle = (value: string, selected: string[], setSelected: (values: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setPage(1);
  };
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = initialProducts.filter((product) => {
      const haystack = [product.title, product.sku, product.manufacturer, product.manufacturer_part_number, product.bearing_type, product.applications.transmission_text, ...product.applications.vehicle_brands, ...product.search.part_numbers].filter(Boolean).join(" ").toLowerCase();
      return (!needle || haystack.includes(needle)) && (!brands.length || brands.includes(product.manufacturer || "")) && (!types.length || types.includes(product.bearing_type || "")) && (!vehicles.length || product.applications.vehicle_brands.some((brand) => vehicles.includes(brand)));
    });
    return [...list].sort((a, b) => sort === "price-low" ? (a.price.amount ?? Infinity) - (b.price.amount ?? Infinity) : sort === "price-high" ? (b.price.amount ?? -1) - (a.price.amount ?? -1) : sort === "name" ? a.title.localeCompare(b.title) : Number(b.commerce.mode === "fixed_price") - Number(a.commerce.mode === "fixed_price"));
  }, [initialProducts, query, brands, types, vehicles, sort]);
  const perPage = 15;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const firstItem = (currentPage - 1) * perPage;
  const visible = filtered.slice(firstItem, firstItem + perPage);
  return <>
    <div className="tag-row"><Link href="/bearings/main-bearing-kits">Main bearing kits</Link><Link href="/bearings/pulley-bearings">Pulley bearings</Link><Link href="/bearings/primary-pulley-bearings">Primary pulley bearings</Link><button onClick={() => { setBrands([]); setTypes([]); setVehicles([]); setPage(1); }}>Clear filters</button></div>
    <div className="catalogue-layout">
      <aside className="filters">
        <Filter title="Filter by manufacturer" items={manufacturers} selected={brands} onToggle={(value) => toggle(value, brands, setBrands)}/>
        <Filter title="Filter by bearing type" items={bearingTypes} selected={types} onToggle={(value) => toggle(value, types, setTypes)}/>
        <Filter title="Filter by vehicle make" items={vehicleBrands} selected={vehicles} onToggle={(value) => toggle(value, vehicles, setVehicles)}/>
      </aside>
      <div><div className="catalogue-tools"><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search SKU, bearing or transmission"/><span>{filtered.length ? `Showing ${firstItem + 1}–${Math.min(firstItem + perPage, filtered.length)} of ${filtered.length}` : "Showing 0 products"}</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="featured">Popularity</option><option value="name">Name</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div><div className="catalogue-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{!filtered.length && <p className="notice">No products match those filters. Try removing one or searching by a shorter part number.</p>}{pages > 1 && <nav className="pagination" aria-label="Catalogue pages"><button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page">‹</button>{Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 2).map((number, index, shown) => <span key={number}>{index > 0 && number - shown[index - 1] > 1 && <i>…</i>}<button className={number === currentPage ? "active" : ""} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>{number}</button></span>)}<button onClick={() => setPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages} aria-label="Next page">›</button></nav>}</div>
    </div>
  </>;
}

function Filter({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="filter-group"><h3>{title}</h3><div>{items.slice(0,14).map((item) => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)}/> {item}</label>)}</div></section>;
}
