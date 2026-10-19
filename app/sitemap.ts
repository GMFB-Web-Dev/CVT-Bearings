import type { MetadataRoute } from "next";
import { productImage } from "@/lib/catalog";
import { getProducts } from "@/lib/catalog-data";
import { getPages, type CmsPage } from "@/lib/cms";

const FALLBACK_ORIGIN = "https://cvt-bearings.vercel.app";
const PRIVATE_PATHS = new Set(["/account", "/cart", "/checkout/success", "/login", "/login-sign-up"]);
const REDIRECT_PATHS = new Set(["/", "/about", "/help", "/orders-payments", "/shipping-returns"]);
const CORE_PATHS = ["/home", "/about-us", "/bearings", "/blogs", "/contact", "/general-info", "/orders-and-payments", "/shipping-and-returns", "/privacy", "/terms", "/cookies"];

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    const url = new URL(configured || FALLBACK_ORIGIN);
    return url.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

function indexablePath(path: string) {
  return path.startsWith("/")
    && !path.startsWith("//")
    && !path.includes("[")
    && !path.includes("]")
    && !PRIVATE_PATHS.has(path)
    && !REDIRECT_PATHS.has(path);
}

function pageSettings(path: string): Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority"> {
  if (path === "/home") return { changeFrequency: "weekly", priority: 1 };
  if (path === "/bearings" || path.startsWith("/bearings/")) return { changeFrequency: "weekly", priority: 0.9 };
  if (path === "/blogs" || path.startsWith("/blogs/")) return { changeFrequency: "monthly", priority: 0.7 };
  if (["/privacy", "/terms", "/cookies"].includes(path)) return { changeFrequency: "yearly", priority: 0.3 };
  return { changeFrequency: "monthly", priority: 0.6 };
}

function validDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [pagesResult, productsResult] = await Promise.allSettled([getPages(), getProducts()]);
  const pages = pagesResult.status === "fulfilled" ? pagesResult.value : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const cmsByPath = new Map(pages.filter((page) => indexablePath(page.path)).map((page) => [page.path, page] as const));
  const publicPaths = new Set([...CORE_PATHS, ...cmsByPath.keys()]);
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of publicPaths) {
    if (!indexablePath(path)) continue;
    const page: CmsPage | undefined = cmsByPath.get(path);
    entries.set(path, {
      url: `${origin}${path === "/" ? "" : path}`,
      lastModified: validDate(page?.updatedAt),
      ...pageSettings(path),
    });
  }

  for (const product of products) {
    if (!product.slug) continue;
    const path = `/products/${encodeURIComponent(product.slug)}`;
    const image = productImage(product);
    entries.set(path, {
      url: `${origin}${path}`,
      lastModified: validDate(product.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
      images: image ? [image.startsWith("http") ? image : `${origin}${image}`] : undefined,
    });
  }

  return [...entries.values()].sort((left, right) => left.url.localeCompare(right.url));
}
