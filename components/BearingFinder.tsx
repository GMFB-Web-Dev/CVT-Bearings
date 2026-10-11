"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ruler, Search } from "lucide-react";
import { useEffect, useState } from "react";

type FinderResult = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: string;
  details: string[];
};

type Option = { value: string; label: string };

export function BearingFinder({ vehicleBrands, bearingTypes }: { vehicleBrands: string[]; bearingTypes: Option[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [inner, setInner] = useState("");
  const [outer, setOuter] = useState("");
  const [width, setWidth] = useState("");
  const [results, setResults] = useState<FinderResult[]>([]);
  const [loading, setLoading] = useState(false);

  const hasCriteria = Boolean(query.trim() || brand || type || inner || outer || width);

  useEffect(() => {
    if (!hasCriteria) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ limit: "4" });
      if (query.trim()) params.set("q", query.trim());
      if (brand) params.set("brand", brand);
      if (type) params.set("type", type);
      if (inner) params.set("inner", inner);
      if (outer) params.set("outer", outer);
      if (width) params.set("width", width);
      params.set("tolerance", "1");
      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?${params}`, { signal: controller.signal });
        const data = response.ok ? await response.json() as { results?: FinderResult[] } : { results: [] };
        setResults(data.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [brand, hasCriteria, inner, outer, query, type, width]);

  return <section className="find-panel">
    <div className="find-box">
      <h2>Find the right <em>bearing for you</em></h2>
      <p className="finder-intro">Search by part number, vehicle, transmission, bearing name—or use the exact measurements if you have them.</p>
      <form action="/bearings" className="finder-form" role="search">
        <label htmlFor="finder-query">Search for anything</label>
        <div className="find-search">
          <input id="finder-query" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={'Try "01J311-445B", "Nissan pulley", or "24x7"'} autoComplete="off"/>
          <button aria-label="Search products"><Search size={20}/></button>
        </div>

        <div className="finder-label-row">
          <label htmlFor="finder-brand">Search by specifics</label>
          <span><Ruler size={15}/> Measurements match within ±1 mm</span>
        </div>
        <div className="specifics finder-specifics">
          <select id="finder-brand" name="brand" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="">Vehicle make</option>
            {vehicleBrands.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select name="type" value={type} onChange={(event) => setType(event.target.value)} aria-label="Bearing type">
            <option value="">Bearing type</option>
            {bearingTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
          <div className="finder-dimensions" aria-label="Bearing dimensions in millimetres">
            <label><span>Inside Ø</span><input name="inner" value={inner} onChange={(event) => setInner(event.target.value)} inputMode="decimal" placeholder="mm" aria-label="Inside diameter in millimetres"/></label>
            <label><span>Outside Ø</span><input name="outer" value={outer} onChange={(event) => setOuter(event.target.value)} inputMode="decimal" placeholder="mm" aria-label="Outside diameter in millimetres"/></label>
            <label><span>Width</span><input name="width" value={width} onChange={(event) => setWidth(event.target.value)} inputMode="decimal" placeholder="mm" aria-label="Width in millimetres"/></label>
          </div>
        </div>
        <input type="hidden" name="tolerance" value="1"/>
        <div className="finder-actions">
          <button className="dark-button">Search all products</button>
          <Link href="/contact?service=product-identification">Not sure? Ask a bearing specialist <ArrowRight size={15}/></Link>
        </div>
      </form>

      {hasCriteria && <div className="finder-preview" aria-live="polite" aria-busy={loading}>
        <div className="finder-preview-heading">
          <strong>{loading ? "Finding the closest matches…" : results.length ? "Best matches" : "No close matches yet"}</strong>
          {!loading && results.length > 0 && <span>Sorted by fit and relevance</span>}
        </div>
        {!loading && results.length > 0 && <div className="finder-result-grid">
          {results.map((product) => <Link href={`/products/${product.slug}`} className="finder-result" key={product.id}>
            <span className="finder-result-image">{product.image ? <Image src={product.image} alt="" width={88} height={88}/> : <small>Image<br/>coming soon</small>}</span>
            <span className="finder-result-copy"><b>{product.title}</b>{product.details.length > 0 && <small>{product.details.join(" · ")}</small>}<strong>{product.price}</strong></span>
            <ArrowRight size={18}/>
          </Link>)}
        </div>}
        {!loading && !results.length && <p>Try a shorter part number, remove one measurement, or allow our team to identify it for you.</p>}
      </div>}
    </div>
  </section>;
}
