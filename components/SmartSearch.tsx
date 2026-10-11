"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  price: string;
  details?: string[];
};

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}&limit=3`, { signal: controller.signal });
        const data = response.ok ? await response.json() as { results?: SearchResult[] } : { results: [] };
        setResults(data.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const hasQuery = Boolean(query.trim());

  return <div className="smart-search" onFocus={() => hasQuery && setOpen(true)} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <form className="header-search" action="/bearings" role="search">
      <input
        name="q"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setOpen(Boolean(nextQuery.trim()));
          if (!nextQuery.trim()) {
            setResults([]);
            setLoading(false);
          }
        }}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        placeholder="Search part number or bearing"
        aria-label="Search products"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={open && hasQuery}
        autoComplete="off"
      />
      <button aria-label="Search"><Search size={16}/></button>
    </form>
    {open && hasQuery && <div className="search-suggestions" id={listId} role="listbox" aria-label="Product suggestions">
      <div className="search-suggestions-heading"><span>Closest products</span>{loading && <small>Searching…</small>}</div>
      {!loading && results.map((product) => <Link className="search-suggestion" role="option" aria-selected="false" href={`/products/${product.slug}`} key={product.id} onClick={() => setOpen(false)}>
        <span className="search-suggestion-image">{product.image ? <Image src={product.image} width={72} height={72} alt=""/> : <small>No image</small>}</span>
        <span><b>{product.title}</b><small>{product.details?.length ? product.details.join(" · ") : "View product"}</small></span>
        <strong>{product.price}</strong>
      </Link>)}
      {!loading && !results.length && <p className="search-empty">No matching products found.</p>}
      <Link className="search-all" href={`/bearings?q=${encodeURIComponent(query.trim())}`} onClick={() => setOpen(false)}>View all search results <span aria-hidden="true">→</span></Link>
    </div>}
  </div>;
}
