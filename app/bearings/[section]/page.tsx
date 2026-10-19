import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Catalogue } from "@/components/Catalogue";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { sectionProducts } from "@/lib/catalog";
import { getProducts } from "@/lib/catalog-data";
import { entry, getPage, section as cmsSection } from "@/lib/cms";

const titles: Record<string, string> = { "main-bearing-kits": "Main Bearing Kits", "pulley-bearings": "Pulley Bearings", "primary-pulley-bearings": "Primary Pulley Bearings" };
export const instant = false;
export function generateStaticParams() { return Object.keys(titles).map((section) => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> { const { section } = await params; return { title: titles[section] || "Bearings" }; }

export default async function BearingSection({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { section } = await params; const query = await searchParams; if (!titles[section]) notFound();
  const [allProducts, page] = await Promise.all([getProducts(), getPage(`/bearings/${section}`)]);
  const content = cmsSection(page, "app/bearings/[section]/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const titleKey = section === "main-bearing-kits" ? "copy-001" : section === "pulley-bearings" ? "copy-002" : "copy-003";
  const title = c(titleKey, titles[section]);
  const products = sectionProducts(allProducts, section);
  return <div className="catalogue-shell"><div className="page-width"><Breadcrumbs items={[{ label: c("copy-004", "Home"), href: "/home" }, { label: c("copy-005", "Bearings"), href: "/bearings" }, { label: title }]}/><div className="catalogue-title"><h1>{title}</h1><p>{c("copy-006", "Search by tag, vehicle, make and bearing type")}</p></div><Catalogue initialProducts={products.length ? products : allProducts} initialQuery={typeof query.q === "string" ? query.q : ""}/></div></div>;
}
