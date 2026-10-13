import "server-only";
import { SITE_KEY } from "@/lib/catalog";
import { blogs } from "@/lib/blogs";

export const TENANT_TAG = `tenant:${SITE_KEY}`;
export const PAGES_TAG = `${TENANT_TAG}:pages`;
export const SHARED_TAG = `${TENANT_TAG}:shared`;
const PAYLOAD_TENANT_ID = 6;
export const PAYLOAD_TENANT_SLUG = process.env.PAYLOAD_TENANT_SLUG || SITE_KEY;
export type CmsEntry = { key: string; text: string; kind?: string };
export type CmsSection = { key: string; heading?: string; entries?: CmsEntry[] };
export type CmsMedia = { url?: string; alt?: string; width?: number; height?: number };
export type CmsAsset = { key: string; asset?: number | CmsMedia };
export type CmsPage = { id: number; slug: string; path: string; title?: string; hero?: { heading?: string; subheading?: string; cta?: { label?: string; url?: string } }; seo?: { title?: string; description?: string }; contentSections?: CmsSection[]; siteAssets?: CmsAsset[]; _status?: string };
export type CmsLink = { label: string; url: string };
export type SiteSettings = { businessName?: string; contact?: { email?: string; phoneDisplay?: string; phoneHref?: string; area?: string; mapLink?: string; mapEmbedURL?: string }; defaultSEO?: { title?: string; description?: string }; primaryCTA?: { label?: string; url?: string }; footer?: { copyright?: string; legalLinks?: CmsLink[] }; contentSections?: CmsSection[]; siteAssets?: CmsAsset[] };
export type Navigation = { headerLinks?: CmsLink[]; footerLinks?: CmsLink[]; headerCTA?: CmsLink };
type PayloadList<T> = { docs: T[]; hasNextPage?: boolean; nextPage?: number | null };

function payloadOrigin() { return (process.env.NEXT_PUBLIC_PAYLOAD_URL || "https://payload.gmfb.co.nz").replace(/\/$/, ""); }
function pageTag(path: string) { const slug = path === "/" ? "home" : path.split("/").filter(Boolean).at(-1) || "home"; return `${TENANT_TAG}:page:${slug}`; }
async function payloadList<T>(collection: string, params: URLSearchParams, tags: string[]) {
  const documents: T[] = []; let page = 1;
  do {
    params.set("page", String(page));
    const response = await fetch(`${payloadOrigin()}/api/${collection}?${params}`, { next: { revalidate: 60, tags }, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Payload ${collection} read failed (${response.status}).`);
    const result = await response.json() as PayloadList<T>; documents.push(...result.docs);
    if (!result.hasNextPage || !result.nextPage) break; page = result.nextPage;
  } while (page < 100);
  return documents;
}
function baseParams({ drafts = true } = {}) { const params = new URLSearchParams({ depth: "2", limit: "100" }); params.set("where[tenant][equals]", String(PAYLOAD_TENANT_ID)); if (drafts) params.set("where[_status][equals]", "published"); return params; }
export async function getPage(path: string) { const params = baseParams(); params.set("where[path][equals]", path); params.set("limit", "1"); return (await payloadList<CmsPage>("pages", params, [TENANT_TAG, PAGES_TAG, pageTag(path)]))[0] ?? null; }
export function getPages() { return payloadList<CmsPage>("pages", baseParams(), [TENANT_TAG, PAGES_TAG]); }
export async function getSiteSettings() { return (await payloadList<SiteSettings>("tenant-site-settings", baseParams({ drafts: false }), [TENANT_TAG, SHARED_TAG]))[0] ?? null; }
export async function getNavigation() { return (await payloadList<Navigation>("navigation", baseParams({ drafts: false }), [TENANT_TAG, SHARED_TAG]))[0] ?? null; }
export function section(source: { contentSections?: CmsSection[] } | null | undefined, key: string) { return source?.contentSections?.find((item) => item.key === key); }
export function entry(source: CmsSection | null | undefined, key: string, fallback: string) { return source?.entries?.find((item) => item.key === key)?.text || fallback; }
export function assetURL(source: { siteAssets?: CmsAsset[] } | null | undefined, key: string, fallback: string) { const asset = source?.siteAssets?.find((item) => item.key === key)?.asset; const path = asset && typeof asset === "object" ? asset.url : null; if (!path) return fallback; return path.startsWith("http") ? path : `${payloadOrigin()}${path.startsWith("/") ? "" : "/"}${path}`; }
export function blogSummaries(settings: SiteSettings | null) {
  const content = section(settings, "lib/blogs.ts");
  return blogs.map((blog, index) => ({
    ...blog,
    title: entry(content, `copy-${String(index * 2 + 1).padStart(3, "0")}`, blog.title),
    tag: entry(content, `copy-${String(index * 2 + 2).padStart(3, "0")}`, blog.tag),
    image: assetURL(settings, blog.image.replace(/^\//, ""), blog.image),
  }));
}
