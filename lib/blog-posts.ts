import "server-only";

import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { cacheLife, cacheTag } from "next/cache";
import { TENANT_TAG } from "@/lib/cms";

const PAYLOAD_TENANT_ID = 6;
const BLOG_PAGE_SIZE = 12;

export const BLOG_POSTS_TAG = `${TENANT_TAG}:blog-posts`;

type CmsImage = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export type BlogPost = {
  id: number | string;
  title: string;
  slug: string;
  path?: string | null;
  template: "article" | "guide" | "case-study";
  excerpt: string;
  featuredImage?: CmsImage | number | null;
  featuredImageAlt?: string | null;
  author?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  body?: SerializedEditorState | null;
  tools?: string | null;
  steps?: {
    id?: string | null;
    title: string;
    body?: SerializedEditorState | null;
    image?: CmsImage | number | null;
    imageAlt?: string | null;
  }[] | null;
  caseStudy?: {
    vehicle?: string | null;
    challenge?: SerializedEditorState | null;
    solution?: SerializedEditorState | null;
    results?: SerializedEditorState | null;
  } | null;
  cta?: { heading?: string | null; label?: string | null; href?: string | null } | null;
  seo?: { title?: string | null; description?: string | null } | null;
  tenant?: number | { id?: number | null } | null;
  _status?: string | null;
};

type PayloadPage<T> = {
  docs: T[];
  totalPages?: number;
  page?: number;
  hasNextPage?: boolean;
  nextPage?: number | null;
};

export type BlogListingItem = {
  slug: string;
  title: string;
  image?: string | null;
  imageAlt?: string | null;
  tag: string;
  excerpt?: string | null;
  publishedAt?: string | null;
};

function payloadOrigin() {
  return (process.env.NEXT_PUBLIC_PAYLOAD_URL || "https://payload.gmfb.co.nz").replace(/\/$/, "");
}

function blogPostTag(slug: string) {
  return `${BLOG_POSTS_TAG}:${slug}`;
}

function isTenantSix(tenant: BlogPost["tenant"]) {
  return tenant === PAYLOAD_TENANT_ID || (typeof tenant === "object" && tenant?.id === PAYLOAD_TENANT_ID);
}

function isPublishedTenantPost(post: BlogPost) {
  return post._status === "published" && isTenantSix(post.tenant);
}

async function requestBlogPosts(params: URLSearchParams) {
  const response = await fetch(`${payloadOrigin()}/api/blog-posts?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Payload blog-posts read failed (${response.status}).`);
  return response.json() as Promise<PayloadPage<BlogPost>>;
}

function baseBlogParams(page = 1) {
  const params = new URLSearchParams({
    sort: "-publishedAt",
    limit: String(BLOG_PAGE_SIZE),
    page: String(page),
    depth: "1",
  });
  params.set("where[tenant][equals]", String(PAYLOAD_TENANT_ID));
  params.set("where[_status][equals]", "published");
  return params;
}

export async function getPublishedBlogPosts() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(BLOG_POSTS_TAG);

  const posts: BlogPost[] = [];
  let page = 1;
  while (page <= 100) {
    const result = await requestBlogPosts(baseBlogParams(page));
    posts.push(...result.docs.filter(isPublishedTenantPost));
    const totalPages = Math.max(1, result.totalPages || 1);
    if (!result.hasNextPage || page >= totalPages) break;
    page = result.nextPage && result.nextPage > page ? result.nextPage : page + 1;
  }
  return posts;
}

export async function getPublishedBlogPost(slug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(BLOG_POSTS_TAG, blogPostTag(slug));

  if (!/^[a-z0-9][a-z0-9-]{0,127}$/.test(slug)) return null;
  const params = baseBlogParams(1);
  params.set("where[slug][equals]", slug);
  params.set("limit", "1");
  const result = await requestBlogPosts(params);
  return result.docs.find((post) => isPublishedTenantPost(post) && post.slug === slug) ?? null;
}

export function getBlogImage(post: BlogPost) {
  return post.featuredImage && typeof post.featuredImage === "object" ? post.featuredImage : null;
}

export function toBlogListingItem(post: BlogPost): BlogListingItem {
  const image = getBlogImage(post);
  return {
    slug: post.slug,
    title: post.title,
    image: image?.url,
    imageAlt: post.featuredImageAlt || image?.alt || post.title,
    tag: post.category || "Article",
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
  };
}
