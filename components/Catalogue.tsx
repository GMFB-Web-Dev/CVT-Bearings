"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { productMatchesDimensions, productMatchesType, productSearchScore } from "@/lib/product-search";

function unique(values: (string | null)[]) {
  return [...new Set(values.filter(Boolean) as string[])].sort();
}

type CatalogueProps = {
  initialProducts: Product[];
  initialQuery?: string;
  initialVehicle?: string;
  initialType?: string;
  initialInner?: number | null;
  initialOuter?: number | null;
  initialWidth?: number | null;
};

export function Catalogue({ initialProducts, initialQuery = "", initialVehicle = "", initialType = "", initialInner = null, initialOuter = null, initialWidth = null }: CatalogueProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>(initialVehicle ? [initialVehicle] : []);
  const [finderType, setFinderType] = useState(initialType);
  const [inner, setInner] = useState<number | null>(initialInner);
  const [outer, setOuter] = useState<number | null>(initialOuter);
  const [width, setWidth] = useState<number | null>(initialWidth);
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
    const list = initialProducts.filter((product) => {
      return (productSearchScore(product, query) != null)
        && (!brands.length || brands.includes(product.manufacturer || ""))
        && (!types.length || types.includes(product.bearing_type || ""))
        && (!vehicles.length || product.applications.vehicle_brands.some((brand) => vehicles.includes(brand)))
        && productMatchesType(product, finderType)
        && productMatchesDimensions(product, { inner, outer, width, tolerance: 1 });
    });
    return [...list].sort((a, b) => sort === "price-low"
      ? (a.price.amount ?? Infinity) - (b.price.amount ?? Infinity)
      : sort === "price-high"
        ? (b.price.amount ?? -1) - (a.price.amount ?? -1)
        : sort === "name"
          ? a.title.localeCompare(b.title)
          : query
            ? (productSearchScore(b, query) ?? 0) - (productSearchScore(a, query) ?? 0)
            : Number(b.commerce.mode === "fixed_price") - Number(a.commerce.mode === "fixed_price"));
  }, [initialProducts, query, brands, types, vehicles, finderType, inner, outer, width, sort]);
  const perPage = 15;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const firstItem = (currentPage - 1) * perPage;
  const visible = filtered.slice(firstItem, firstItem + perPage);
  return <>
    <nav className="tag-row" aria-label="Bearing categories">
      <Link className={pathname === "/bearings/main-bearing-kits" ? "active" : ""} aria-current={pathname === "/bearings/main-bearing-kits" ? "page" : undefined} href="/bearings/main-bearing-kits">Main bearing kits</Link>
      <Link className={pathname === "/bearings/pulley-bearings" ? "active" : ""} aria-current={pathname === "/bearings/pulley-bearings" ? "page" : undefined} href="/bearings/pulley-bearings">Pulley bearings</Link>
      <Link className={pathname === "/bearings/primary-pulley-bearings" ? "active" : ""} aria-current={pathname === "/bearings/primary-pulley-bearings" ? "page" : undefined} href="/bearings/primary-pulley-bearings">Primary pulley bearings</Link>
    </nav>
    {(query || vehicles.length || finderType || inner != null || outer != null || width != null) && <div className="finder-filter-summary">
      <span>Matching:</span>
      {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }}>“{query}” ×</button>}
      {vehicles.map((vehicle) => <button type="button" key={vehicle} onClick={() => { setVehicles(vehicles.filter((item) => item !== vehicle)); setPage(1); }}>{vehicle} ×</button>)}
      {finderType && <button type="button" onClick={() => { setFinderType(""); setPage(1); }}>{finderType.replaceAll("_", " ")} ×</button>}
      {inner != null && <button type="button" onClick={() => { setInner(null); setPage(1); }}>Inside Ø {inner} mm ×</button>}
      {outer != null && <button type="button" onClick={() => { setOuter(null); setPage(1); }}>Outside Ø {outer} mm ×</button>}
      {width != null && <button type="button" onClick={() => { setWidth(null); setPage(1); }}>Width {width} mm ×</button>}
      <button className="clear" type="button" onClick={() => { setQuery(""); setBrands([]); setTypes([]); setVehicles([]); setFinderType(""); setInner(null); setOuter(null); setWidth(null); setSort("featured"); setPage(1); }}>Clear all</button>
    </div>}
    <div className="catalogue-layout">
      <aside className="filters">
        <div className="filters-heading"><strong>Filter products</strong></div>
        <Filter title="Filter by manufacturer" items={manufacturers} selected={brands} onToggle={(value) => toggle(value, brands, setBrands)}/>
        <Filter title="Filter by bearing type" items={bearingTypes} selected={types} onToggle={(value) => toggle(value, types, setTypes)}/>
        <Filter title="Filter by vehicle make" items={vehicleBrands} selected={vehicles} onToggle={(value) => toggle(value, vehicles, setVehicles)}/>
        <section className="filter-group dimension-filter-group"><h3>Find by dimensions</h3><div className="catalogue-dimensions">
          <label>Inside diameter<input type="number" min="0" step="0.1" value={inner ?? ""} onChange={(event) => { setInner(event.target.value ? Number(event.target.value) : null); setPage(1); }} placeholder="mm"/></label>
          <label>Outside diameter<input type="number" min="0" step="0.1" value={outer ?? ""} onChange={(event) => { setOuter(event.target.value ? Number(event.target.value) : null); setPage(1); }} placeholder="mm"/></label>
          <label>Width<input type="number" min="0" step="0.1" value={width ?? ""} onChange={(event) => { setWidth(event.target.value ? Number(event.target.value) : null); setPage(1); }} placeholder="mm"/></label>
          <small>Matches within ±1 mm.</small>
        </div></section>
      </aside>
      <div><div className="catalogue-tools"><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search SKU, bearing or transmission"/><span>{filtered.length ? `Showing ${firstItem + 1}–${Math.min(firstItem + perPage, filtered.length)} of ${filtered.length}` : "Showing 0 products"}</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="featured">Popularity</option><option value="name">Name</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div><div className="catalogue-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{!filtered.length && <p className="notice">No products match those filters. Try removing one or searching by a shorter part number.</p>}{pages > 1 && <nav className="pagination" aria-label="Catalogue pages"><button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page">‹</button>{Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 2).map((number, index, shown) => <span key={number}>{index > 0 && number - shown[index - 1] > 1 && <i>…</i>}<button className={number === currentPage ? "active" : ""} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>{number}</button></span>)}<button onClick={() => setPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages} aria-label="Next page">›</button></nav>}</div>
    </div>
  </>;
}

function Filter({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="filter-group"><h3>{title}</h3><div>{items.slice(0,14).map((item) => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)}/> {item}</label>)}</div></section>;
}
