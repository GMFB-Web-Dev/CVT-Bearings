import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SearchPanel } from "@/components/SharedSections";
import { getProducts } from "@/lib/catalog-data";
import { blogSummaries, entry, getPage, getPages, getSiteSettings, section } from "@/lib/cms";

export const instant = false;
export async function generateStaticParams() { return (await getPages()).filter((page) => page.path.startsWith("/blogs/")).map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(`/blogs/${slug}`);
  return { title: page?.seo?.title || page?.hero?.heading || "Blog", description: page?.seo?.description };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, settings, products] = await Promise.all([getPage(`/blogs/${slug}`), getSiteSettings(), getProducts()]);
  if (!page) notFound();
  const summaries = blogSummaries(settings);
  const blog = summaries.find((item) => item.slug === slug);
  if (!blog) notFound();
  const content = section(page, "app/blogs/[slug]/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const toc = Array.from({ length: 7 }, (_, index) => ({ href: c(`copy-${String(index * 2 + 3).padStart(3, "0")}`, "#section"), label: c(`copy-${String(index * 2 + 4).padStart(3, "0")}`, "Article section") }));
  const article = [
    ["identify", c("copy-019", "Start by identifying the correct CVT"), [c("copy-020", "Confirm exactly which transmission is fitted to the vehicle."), c("copy-021", "Confirm the VIN or chassis number where possible.")]],
    ["part-number", c("copy-022", "Check the original bearing part number"), [c("copy-023", "Inspect the original bearing carefully before ordering a replacement.")]],
    ["measure", c("copy-024", "Measure the CVT bearing"), [c("copy-025", "Measure the inner diameter, outer diameter and width accurately.")]],
    ["dimensions", c("copy-026", "Why dimensions alone are not enough"), [c("copy-027", "Two bearings can share dimensions while having different specifications.")]],
    ["match", c("copy-028", "Match the transmission and bearing information together"), [c("copy-029", "Combine several pieces of information rather than relying on a single detail.")]],
    ["photos", c("copy-030", "Take clear photos before ordering"), [c("copy-031", "Photographs can help when part numbers are difficult to read.")]],
    ["original", c("copy-032", "Keep the original bearing"), [c("copy-033", "Do not dispose of the original bearing until the replacement has been confirmed.")]],
  ] as const;
  return <div className="article-shell"><div className="article-hero"/><nav className="article-toc" aria-label={c("copy-001", "Table of contents")}><b>{c("copy-002", "Table of contents")}</b>{toc.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav><article className="article-card"><small>{c("copy-017", "Written by Buying Guide")}</small><h1>{blog.title}</h1><p style={{ textAlign: "center", color: "#697184" }}>{c("copy-018", "October 8, 2026 · 7 min read")}</p>{article.map(([id, heading, paragraphs]) => <section key={id}><h2 id={id}>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div style={{ textAlign: "center", marginTop: 40 }}><Link className="button" href={c("copy-034", "/contact")}>{c("copy-035", "Ask our team")}</Link></div></article><section className="content-section"><h2 style={{ textAlign: "center" }}>{c("copy-036", "View other")} <em>{c("copy-037", "blogs")}</em></h2><div className="blogs-grid">{summaries.filter((item) => item.slug !== slug).slice(0, 3).map((item) => <Link className="blog-card" key={item.slug} href={`/blogs/${item.slug}`}><Image src={item.image} width={500} height={500} alt=""/><h3>{item.title}</h3></Link>)}</div></section><SearchPanel products={products}/></div>;
}
