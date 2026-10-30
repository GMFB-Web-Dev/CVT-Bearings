import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostTemplate } from "@/components/BlogPostTemplates";
import { SearchPanel } from "@/components/SharedSections";
import { getBlogImage, getPublishedBlogPost, getPublishedBlogPosts, toBlogListingItem, type BlogPost } from "@/lib/blog-posts";
import { getProducts } from "@/lib/catalog-data";
import "../blog-templates.css";

const SITE_ORIGIN = "https://www.cvtbearings.co.nz";

export const instant = false;

const getPost = cache((slug: string) => getPublishedBlogPost(slug));

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

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return postMetadata(post);
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

export default async function BlogPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const [post, products, posts] = await Promise.all([getPost(slug), getProducts(), getPublishedBlogPosts()]);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== slug).slice(0, 3).map(toBlogListingItem);
  return <div className="article-shell"><BlogJsonLd post={post}/><BlogPostTemplate post={post} related={related}/><SearchPanel products={products}/></div>;
}
