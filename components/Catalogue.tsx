"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { CustomSelect } from "@/components/CustomSelect";
import { productMatchesDimensions, productMatchesType, productSearchScore } from "@/lib/product-search";

function unique(values: (string | null)[]) {
  return [...new Set(values.filter(Boolean) as string[])].sort();
}

function normaliseLabel(value: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>(initialVehicle ? [initialVehicle] : []);
  const [finderType, setFinderType] = useState(initialType);
  const [inner, setInner] = useState<number | null>(initialInner);
  const [outer, setOuter] = useState<number | null>(initialOuter);
  const [width, setWidth] = useState<number | null>(initialWidth);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const manufacturers = unique(initialProducts.map((product) => product.manufacturer));
  const bearingTypes = unique(initialProducts.map((product) => product.bearing_type));
  const transmissionTypes = unique(initialProducts.map((product) => normaliseLabel(product.applications.transmission_text)));
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
        && (!transmissions.length || transmissions.includes(normaliseLabel(product.applications.transmission_text)))
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
  }, [initialProducts, query, brands, types, transmissions, vehicles, finderType, inner, outer, width, sort]);
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
    {(query || brands.length || types.length || transmissions.length || vehicles.length || finderType || inner != null || outer != null || width != null) && <div className="finder-filter-summary">
      <span>Matching:</span>
      {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }}>“{query}” ×</button>}
      {brands.map((brand) => <button type="button" key={brand} onClick={() => { setBrands(brands.filter((item) => item !== brand)); setPage(1); }}>{brand} ×</button>)}
      {types.map((type) => <button type="button" key={type} onClick={() => { setTypes(types.filter((item) => item !== type)); setPage(1); }}>{titleCase(type)} ×</button>)}
      {transmissions.map((transmission) => <button type="button" key={transmission} onClick={() => { setTransmissions(transmissions.filter((item) => item !== transmission)); setPage(1); }}>{transmission} ×</button>)}
      {vehicles.map((vehicle) => <button type="button" key={vehicle} onClick={() => { setVehicles(vehicles.filter((item) => item !== vehicle)); setPage(1); }}>{vehicle} ×</button>)}
      {finderType && <button type="button" onClick={() => { setFinderType(""); setPage(1); }}>{finderType.replaceAll("_", " ")} ×</button>}
      {inner != null && <button type="button" onClick={() => { setInner(null); setPage(1); }}>Inside Ø {inner} mm ×</button>}
      {outer != null && <button type="button" onClick={() => { setOuter(null); setPage(1); }}>Outside Ø {outer} mm ×</button>}
      {width != null && <button type="button" onClick={() => { setWidth(null); setPage(1); }}>Width {width} mm ×</button>}
      <button className="clear" type="button" onClick={() => { setQuery(""); setBrands([]); setTypes([]); setTransmissions([]); setVehicles([]); setFinderType(""); setInner(null); setOuter(null); setWidth(null); setPage(1); }}>Clear all</button>
    </div>}
    <div className="catalogue-tools catalogue-header-tools"><span>{filtered.length ? `Showing ${firstItem + 1} - ${Math.min(firstItem + perPage, filtered.length)} of ${filtered.length} Products` : "Showing 0 Products"}</span><div className="sort-control"><span>Sort by:</span><CustomSelect ariaLabel="Sort products" variant="accent" value={sort} options={[{ value: "featured", label: "Popularity" }, { value: "name", label: "Name" }, { value: "price-low", label: "Price: Low to high" }, { value: "price-high", label: "Price: High to low" }]} onChange={(nextSort) => { setSort(nextSort); setPage(1); }}/></div></div>
    <div className="catalogue-layout">
      <aside className="filters catalogue-filters">
        <div className="filters-heading"><strong>All filters</strong><button type="button" onClick={() => { setQuery(""); setBrands([]); setTypes([]); setTransmissions([]); setVehicles([]); setFinderType(""); setInner(null); setOuter(null); setWidth(null); setPage(1); }}>Clear all</button></div>
        <Filter title="Filter by bearing type" items={bearingTypes} selected={types} formatLabel={titleCase} onToggle={(value) => toggle(value, types, setTypes)}/>
        <Filter title="Filter by brand" items={manufacturers} selected={brands} onToggle={(value) => toggle(value, brands, setBrands)}/>
        <Filter title="Filter by transmission" items={transmissionTypes} selected={transmissions} onToggle={(value) => toggle(value, transmissions, setTransmissions)}/>
        <Filter title="Filter by car brand" items={vehicleBrands} selected={vehicles} onToggle={(value) => toggle(value, vehicles, setVehicles)}/>
      </aside>
      <div><div className="catalogue-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{!filtered.length && <p className="notice">No products match those filters. Try removing one or searching by a shorter part number.</p>}{pages > 1 && <div className="catalogue-pagination-row"><span>{`Showing ${firstItem + 1} - ${Math.min(firstItem + perPage, filtered.length)} of ${filtered.length} Products`}</span><nav className="pagination" aria-label="Catalogue pages"><button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page">‹</button>{Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 2).map((number, index, shown) => <span key={number}>{index > 0 && number - shown[index - 1] > 1 && <i>…</i>}<button className={number === currentPage ? "active" : ""} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>{number}</button></span>)}<button onClick={() => setPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages} aria-label="Next page">›</button></nav></div>}</div>
    </div>
  </>;
}

function Filter({ title, items, selected, onToggle, formatLabel = (value) => value }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void; formatLabel?: (value: string) => string }) {
  const [open, setOpen] = useState(true);
  const panelId = `filter-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <section className={`filter-group${open ? " is-open" : ""}`}><button className="filter-toggle" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}><span>{title}</span><ChevronDown aria-hidden="true"/></button>{open && <div className="filter-options" id={panelId}>{items.map((item) => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)}/><span>{formatLabel(item)}</span></label>)}</div>}</section>;
}
