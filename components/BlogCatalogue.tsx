"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { BlogListingItem } from "@/lib/blog-posts";
import { CustomSelect } from "@/components/CustomSelect";

const BLOGS_PER_PAGE = 3 * 4;
const TOPIC_OPTIONS = ["All Blogs", "Bearing Problems & Symptoms", "Diagnosis & Troubleshooting", "Repairs & Replacement", "Maintenance & Prevention", "Vehicle & Transmission Guides", "Technical Guides", "Workshop & Buying Advice"];
const VEHICLE_OPTIONS = ["Nissan", "Toyota", "Subaru", "Mitsubishi", "Honda", "Suzuki", "Mazda", "Hyundai / Kia", "Other"];
const SYMPTOM_OPTIONS = ["Whining / Noise", "Shuddering / Juddering", "Slipping", "Overheating", "Loss of Drive", "Warning Lights", "Delayed Engagement", "Vibration"];
const TRANSMISSION_OPTIONS = ["K313", "HCF2", "6F35", "JF015E", "TR580", "TR690"];

export function BlogCatalogue({ initialBlogs }: { initialBlogs: BlogListingItem[] }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [transmissionQuery, setTransmissionQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const visibleTransmissions = TRANSMISSION_OPTIONS.filter((transmission) => transmission.toLowerCase().includes(transmissionQuery.trim().toLowerCase()));

  const filtered = useMemo(() => {
    const selectedTopics = topics.filter((topic) => topic !== "All Blogs");
    const matches = initialBlogs.filter((blog) => (
      (!selectedTopics.length || selectedTopics.some((topic) => blog.filterTopics.includes(topic)))
      && (!vehicles.length || vehicles.some((vehicle) => vehicle === "Other" ? !blog.vehicleMakes.length : blog.vehicleMakes.includes(vehicle)))
      && (!symptoms.length || symptoms.some((symptom) => blog.symptoms.includes(symptom)))
      && (!transmissions.length || transmissions.some((transmission) => blog.transmissions.includes(transmission)))
    ));
    return sort === "name" ? [...matches].sort((left, right) => left.title.localeCompare(right.title)) : matches;
  }, [initialBlogs, sort, symptoms, topics, transmissions, vehicles]);

  const pages = Math.max(1, Math.ceil(filtered.length / BLOGS_PER_PAGE));
  const currentPage = Math.min(page, pages);
  const firstItem = (currentPage - 1) * BLOGS_PER_PAGE;
  const visible = filtered.slice(firstItem, firstItem + BLOGS_PER_PAGE);

  function toggle(value: string, selected: string[], setSelected: (values: string[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setPage(1);
  }

  function toggleTopic(value: string) {
    if (value === "All Blogs") setTopics((selected) => selected.includes(value) ? [] : [value]);
    else setTopics((selected) => selected.includes(value) ? selected.filter((topic) => topic !== value) : [...selected.filter((topic) => topic !== "All Blogs"), value]);
    setPage(1);
  }

  function clearFilters() {
    setTopics([]);
    setVehicles([]);
    setSymptoms([]);
    setTransmissions([]);
    setTransmissionQuery("");
    setPage(1);
  }

  return (
    <div className="blog-catalogue-shell">
      <div className="catalogue-tools blog-tools">
        <span>{filtered.length ? `Showing ${firstItem + 1}–${Math.min(firstItem + BLOGS_PER_PAGE, filtered.length)} of ${filtered.length} Blogs` : "Showing 0 Blogs"}</span>
        <div className="sort-control"><span>Sort by:</span><CustomSelect ariaLabel="Sort articles" variant="accent" value={sort} options={[{ value: "recent", label: "Popularity" }, { value: "name", label: "Name" }]} onChange={(nextSort) => { setSort(nextSort); setPage(1); }}/></div>
      </div>
      <div className="blog-catalogue-layout">
        <aside className="filters catalogue-filters blog-filters">
          <div className="filters-heading"><strong>All filters</strong><button type="button" onClick={clearFilters}>Clear all</button></div>
          <BlogFilter title="Filter by article topic" items={TOPIC_OPTIONS} selected={topics} onToggle={toggleTopic}/>
          <BlogFilter title="Filter by vehicle make" items={VEHICLE_OPTIONS} selected={vehicles} onToggle={(value) => toggle(value, vehicles, setVehicles)}/>
          <BlogFilter title="Filter by symptom" items={SYMPTOM_OPTIONS} selected={symptoms} onToggle={(value) => toggle(value, symptoms, setSymptoms)}/>
          <BlogFilter title="Filter by transmission" items={visibleTransmissions} selected={transmissions} onToggle={(value) => toggle(value, transmissions, setTransmissions)}>
            <form className="blog-filter-search" role="search" onSubmit={(event) => event.preventDefault()}>
              <input aria-label="Search transmission code" placeholder="Search transmission code" value={transmissionQuery} onChange={(event) => setTransmissionQuery(event.target.value)}/>
              <button type="submit" aria-label="Search transmission codes"><Search aria-hidden="true"/></button>
            </form>
          </BlogFilter>
        </aside>
        <div>
        <div className="blogs-grid">
          {visible.map((blog) => (
            <Link className="blog-card" href={`/blogs/${blog.slug}`} key={blog.slug}>
              {blog.image
                ? <Image src={blog.image} fill sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" alt={blog.imageAlt || blog.title}/>
                : <span className="blog-card__placeholder" aria-hidden="true"/>}
              <span className="blog-card__content"><small>{blog.tag}</small><h3>{blog.title}</h3>{blog.excerpt && <p>{blog.excerpt}</p>}</span>
            </Link>
          ))}
        </div>
        {!filtered.length && <p className="notice">No articles match those filters.</p>}
        {filtered.length > BLOGS_PER_PAGE && pages > 1 && (
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
    </div>
  );
}

function BlogFilter({ title, items, selected, onToggle, children }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void; children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  const panelId = `blog-filter-${id.replaceAll(":", "")}`;
  return <section className={`filter-group${open ? " is-open" : ""}`}><button className="filter-toggle" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}><span>{title}</span><ChevronDown aria-hidden="true"/></button>{open && <div className="filter-options" id={panelId}>{children}{items.map((item) => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)}/><span>{item}</span></label>)}</div>}</section>;
}
