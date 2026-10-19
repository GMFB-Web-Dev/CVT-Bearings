"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogListingItem } from "@/lib/blog-posts";

const BLOGS_PER_PAGE = 12;

export function BlogCatalogue({ initialBlogs }: { initialBlogs: BlogListingItem[] }) {
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const availableTopics = useMemo(() => [...new Set(initialBlogs.map((blog) => blog.tag))].sort(), [initialBlogs]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = initialBlogs.filter((blog) => (
      (!needle || `${blog.title} ${blog.tag} ${blog.excerpt || ""}`.toLowerCase().includes(needle))
      && (!topics.length || topics.includes(blog.tag))
    ));
    return sort === "name" ? [...matches].sort((left, right) => left.title.localeCompare(right.title)) : matches;
  }, [initialBlogs, query, sort, topics]);

  const pages = Math.max(1, Math.ceil(filtered.length / BLOGS_PER_PAGE));
  const currentPage = Math.min(page, pages);
  const firstItem = (currentPage - 1) * BLOGS_PER_PAGE;
  const visible = filtered.slice(firstItem, firstItem + BLOGS_PER_PAGE);

  function toggleTopic(value: string) {
    setTopics((selected) => selected.includes(value) ? selected.filter((topic) => topic !== value) : [...selected, value]);
    setPage(1);
  }

  return (
    <div className="blog-catalogue-layout">
      <aside className="filters blog-filters">
        <section className="filter-group">
          <h3>Filter by article topic</h3>
          <div>{availableTopics.map((topic) => <label key={topic}><input type="checkbox" checked={topics.includes(topic)} onChange={() => toggleTopic(topic)}/> {topic}</label>)}</div>
        </section>
      </aside>
      <div>
        <div className="catalogue-tools blog-tools">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search articles" aria-label="Search articles"/>
          <span>{filtered.length ? `Showing ${firstItem + 1}–${Math.min(firstItem + BLOGS_PER_PAGE, filtered.length)} of ${filtered.length} blogs` : "Showing 0 blogs"}</span>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort articles">
            <option value="recent">Most recent</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="blogs-grid">
          {visible.map((blog) => (
            <Link className="blog-card" href={`/blogs/${blog.slug}`} key={blog.slug}>
              {blog.image
                ? <Image src={blog.image} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" alt={blog.imageAlt || blog.title}/>
                : <span className="blog-card__placeholder" aria-hidden="true"/>}
              <span className="blog-card__content"><small>{blog.tag}</small><h3>{blog.title}</h3></span>
            </Link>
          ))}
        </div>
        {!filtered.length && <p className="notice">No articles match those filters.</p>}
        {pages > 1 && (
          <nav className="pagination" aria-label="Blog pages">
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page">‹</button>
            {Array.from({ length: pages }, (_, index) => index + 1)
              .filter((number) => number === 1 || number === pages || Math.abs(number - currentPage) <= 2)
              .map((number, index, shown) => (
                <span key={number}>
                  {index > 0 && number - shown[index - 1] > 1 && <i>…</i>}
                  <button className={number === currentPage ? "active" : ""} onClick={() => setPage(number)} aria-current={number === currentPage ? "page" : undefined}>{number}</button>
                </span>
              ))}
            <button onClick={() => setPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages} aria-label="Next page">›</button>
          </nav>
        )}
      </div>
    </div>
  );
}
