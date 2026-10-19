import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostTemplate } from "@/components/BlogPostTemplates";
import { SearchPanel } from "@/components/SharedSections";
import {
  getBlogImage,
  getPublishedBlogPost,
  getPublishedBlogPosts,
  isLegacyBlogFallbackEnabled,
  type BlogPost,
} from "@/lib/blog-posts";
import { getProducts } from "@/lib/catalog-data";
import { blogSummaries, entry, getPage, getPages, getSiteSettings, section, type CmsPage, type SiteSettings } from "@/lib/cms";
import "../blog-templates.css";

const SITE_ORIGIN = "https://www.cvtbearings.co.nz";

export const instant = false;

const getBlogRoute = cache(async (slug: string) => {
  const post = await getPublishedBlogPost(slug);
  if (post) return { post, legacyPage: null };
  if (!isLegacyBlogFallbackEnabled(slug)) return { post: null, legacyPage: null };
  return { post: null, legacyPage: await getPage(`/blogs/${slug}`) };
});

function absoluteUrl(path: string) {
  try { return new URL(path, SITE_ORIGIN).toString(); }
  catch { return SITE_ORIGIN; }
}

function canonicalUrl(slug: string) {
  return `${SITE_ORIGIN}/blogs/${slug}`;
}

function postMetadata(post: BlogPost): Metadata {
  const image = getBlogImage(post)?.url;
  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const canonical = canonicalUrl(post.slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: absoluteUrl(image), alt: post.featuredImageAlt || getBlogImage(post)?.alt || post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

function legacyMetadata(slug: string, page: CmsPage): Metadata {
  const title = page.seo?.title || page.hero?.heading || "CVT Bearing Blog";
  const description = page.seo?.description || "Practical CVT bearing guidance from CVT Bearings NZ.";
  const canonical = canonicalUrl(slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "article", title, description, url: canonical },
    twitter: { card: "summary", title, description },
  };
}

export async function generateStaticParams() {
  const [pagesResult, postsResult] = await Promise.allSettled([getPages(), getPublishedBlogPosts()]);
  const legacySlugs = pagesResult.status === "fulfilled"
    ? pagesResult.value.filter((page) => page.path.startsWith("/blogs/") && isLegacyBlogFallbackEnabled(page.slug)).map((page) => page.slug)
    : [];
  const postSlugs = postsResult.status === "fulfilled" ? postsResult.value.map((post) => post.slug) : [];
  return [...new Set([...legacySlugs, ...postSlugs])].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const route = await getBlogRoute(slug);
  if (route.post) return postMetadata(route.post);
  if (route.legacyPage) return legacyMetadata(slug, route.legacyPage);
  notFound();
}

function BlogJsonLd({ post }: { post: BlogPost }) {
  const image = getBlogImage(post)?.url;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo?.description || post.excerpt,
    mainEntityOfPage: canonicalUrl(post.slug),
    url: canonicalUrl(post.slug),
    image: image ? [absoluteUrl(image)] : undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: post.author ? { "@type": "Person", name: post.author } : { "@type": "Organization", name: "CVT Bearings NZ" },
    publisher: { "@type": "Organization", name: "CVT Bearings NZ" },
  };
  return <script type="application/ld+json">{JSON.stringify(data).replace(/</g, "\\u003c")}</script>;
}

function LegacyJsonLd({ slug, page, title, image }: { slug: string; page: CmsPage; title: string; image: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    mainEntityOfPage: canonicalUrl(slug),
    url: canonicalUrl(slug),
    image: [absoluteUrl(image)],
    dateModified: page.updatedAt || undefined,
    author: { "@type": "Organization", name: "CVT Bearings NZ" },
    publisher: { "@type": "Organization", name: "CVT Bearings NZ" },
  };
  return <script type="application/ld+json">{JSON.stringify(data).replace(/</g, "\\u003c")}</script>;
}

function LegacyBlogPost({ slug, page, settings }: { slug: string; page: CmsPage; settings: SiteSettings | null }) {
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
  return (
    <div className="article-shell">
      <LegacyJsonLd slug={slug} page={page} title={blog.title} image={blog.image}/>
      <div className="article-hero"/>
      <nav className="article-toc" aria-label={c("copy-001", "Table of contents")}><b>{c("copy-002", "Table of contents")}</b>{toc.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
      <article className="article-card">
        <small>{c("copy-017", "Written by Buying Guide")}</small>
        <h1>{blog.title}</h1>
        <p style={{ textAlign: "center", color: "#697184" }}>{c("copy-018", "October 8, 2026 · 7 min read")}</p>
        {article.map(([id, heading, paragraphs]) => <section key={id}><h2 id={id}>{heading}</h2>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        <div style={{ textAlign: "center", marginTop: 40 }}><Link className="button" href={c("copy-034", "/contact")}>{c("copy-035", "Ask our team")}</Link></div>
      </article>
      <section className="content-section">
        <h2 style={{ textAlign: "center" }}>{c("copy-036", "View other")} <em>{c("copy-037", "blogs")}</em></h2>
        <div className="blogs-grid">{summaries.filter((item) => item.slug !== slug && isLegacyBlogFallbackEnabled(item.slug)).slice(0, 3).map((item) => <Link className="blog-card" key={item.slug} href={`/blogs/${item.slug}`}><Image src={item.image} width={500} height={500} alt={item.title}/><h3>{item.title}</h3></Link>)}</div>
      </section>
    </div>
  );
}

export default async function BlogPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const [route, settings, products] = await Promise.all([getBlogRoute(slug), getSiteSettings(), getProducts()]);
  if (route.post) {
    return <div className="article-shell"><BlogJsonLd post={route.post}/><BlogPostTemplate post={route.post}/><SearchPanel products={products}/></div>;
  }
  if (!route.legacyPage) notFound();
  return <><LegacyBlogPost slug={slug} page={route.legacyPage} settings={settings}/><SearchPanel products={products}/></>;
}
