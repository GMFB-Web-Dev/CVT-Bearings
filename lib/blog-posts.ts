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
  filterTopics: string[];
  vehicleMakes: string[];
  symptoms: string[];
  transmissions: string[];
  excerpt?: string | null;
  publishedAt?: string | null;
};

const VEHICLE_MAKES = ["Nissan", "Toyota", "Subaru", "Mitsubishi", "Honda", "Suzuki", "Mazda", "Hyundai / Kia"];
const TRANSMISSIONS = ["K313", "HCF2", "6F35", "JF015E", "TR580", "TR690"];

function matches(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

function inferTopics(category: string, text: string) {
  const topics = new Set<string>();
  if (/diagnostic/i.test(category) || matches(text, [/noise/, /warning light/, /vibrat/, /symptom/, /fail/])) {
    topics.add("Bearing Problems & Symptoms");
    topics.add("Diagnosis & Troubleshooting");
  }
  if (/product guide/i.test(category) || matches(text, [/repair/, /replacement/, /replace/, /rebuild/])) topics.add("Repairs & Replacement");
  if (/workshop/i.test(category) || matches(text, [/maintenance/, /prevent/, /handling/, /storage/, /installation habit/])) topics.add("Maintenance & Prevention");
  if (/buying guide|product guide/i.test(category) || matches(text, [/vehicle/, /transmission code/, /cvt application/])) topics.add("Vehicle & Transmission Guides");
  if (/product guide|practical advice|buying guide/i.test(category) || matches(text, [/measurement/, /technical/, /identif/, /pulley/])) topics.add("Technical Guides");
  if (/ordering|workshop|buying guide|practical advice/i.test(category)) topics.add("Workshop & Buying Advice");
  return [...topics];
}

function inferSymptoms(text: string) {
  const rules: [string, RegExp[]][] = [
    ["Whining / Noise", [/whin/, /noise/, /hum/, /rumble/]],
    ["Shuddering / Juddering", [/shudder/, /judder/]],
    ["Slipping", [/slip/]],
    ["Overheating", [/overheat/, /high temperature/, /temperature warning/]],
    ["Loss of Drive", [/loss of drive/, /loses drive/, /lost drive/, /no drive/]],
    ["Warning Lights", [/warning light/, /fault light/, /dashboard light/]],
    ["Delayed Engagement", [/delayed engagement/, /delay(?:ed)?.{0,20}engag/]],
    ["Vibration", [/vibrat/]],
  ];
  return rules.filter(([, patterns]) => matches(text, patterns)).map(([label]) => label);
}

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
  const category = post.category || "Article";
  const filterText = [post.title, post.excerpt, category, post.tools, post.caseStudy?.vehicle, JSON.stringify(post.body || {})]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return {
    slug: post.slug,
    title: post.title,
    image: image?.url,
    imageAlt: post.featuredImageAlt || image?.alt || post.title,
    tag: category,
    filterTopics: inferTopics(category, filterText),
    vehicleMakes: VEHICLE_MAKES.filter((make) => make.split(" / ").some((name) => filterText.includes(name.toLowerCase()))),
    symptoms: inferSymptoms(filterText),
    transmissions: TRANSMISSIONS.filter((transmission) => filterText.includes(transmission.toLowerCase())),
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
  };
}
