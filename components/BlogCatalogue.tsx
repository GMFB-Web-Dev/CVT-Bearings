"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { blogs } from "@/lib/blogs";

const vehicleMakes = ["Nissan", "Toyota", "Subaru", "Mitsubishi", "Honda", "Suzuki"];
const transmissions = ["JF011", "K313", "TR580", "JF015", "JF016", "JF017"];

export function BlogCatalogue() {
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [gearboxes, setGearboxes] = useState<string[]>([]);
  const [sort, setSort] = useState("popularity");
  const library = useMemo(() => Array.from({ length: 12 }, (_, index) => ({ ...blogs[index % blogs.length], vehicle: vehicleMakes[index % vehicleMakes.length], transmission: transmissions[index % transmissions.length], instance: index })), []);
  const toggle = (value: string, selected: string[], update: (values: string[]) => void) => update(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = library.filter((blog) => (!needle || `${blog.title} ${blog.tag} ${blog.vehicle} ${blog.transmission}`.toLowerCase().includes(needle)) && (!topics.length || topics.includes(blog.tag)) && (!vehicles.length || vehicles.includes(blog.vehicle)) && (!gearboxes.length || gearboxes.includes(blog.transmission)));
    return sort === "name" ? [...filtered].sort((a, b) => a.title.localeCompare(b.title)) : filtered;
  }, [gearboxes, library, query, sort, topics, vehicles]);

  return <div className="blog-catalogue-layout">
    <aside className="filters blog-filters">
      <Filter title="Filter by article topic" items={[...new Set(blogs.map((blog) => blog.tag))]} selected={topics} onToggle={(value) => toggle(value, topics, setTopics)}/>
      <Filter title="Filter by vehicle make" items={vehicleMakes} selected={vehicles} onToggle={(value) => toggle(value, vehicles, setVehicles)}/>
      <Filter title="Filter by transmission" items={transmissions} selected={gearboxes} onToggle={(value) => toggle(value, gearboxes, setGearboxes)}/>
    </aside>
    <div>
      <div className="catalogue-tools blog-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles"/><span>{visible.length ? `Showing 1–${visible.length} of ${visible.length} blogs` : "Showing 0 blogs"}</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popularity">Popularity</option><option value="name">Name</option></select></div>
      <div className="blogs-grid">{visible.map((blog) => <Link className="blog-card" href={`/blogs/${blog.slug}`} key={`${blog.slug}-${blog.instance}`}><Image src={blog.image} width={700} height={500} alt=""/><h3>{blog.title}</h3></Link>)}</div>
      {!visible.length && <p className="notice">No articles match those filters.</p>}
    </div>
  </div>;
}

function Filter({ title, items, selected, onToggle }: { title: string; items: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="filter-group"><h3>{title}</h3><div>{items.map((item) => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)}/> {item}</label>)}</div></section>;
}
