import type { Metadata } from "next";
import { Catalogue } from "@/components/Catalogue";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProducts } from "@/lib/catalog-data";
import { parseDimension } from "@/lib/product-search";
import { entry, getPage, section } from "@/lib/cms";
import { BrandMarquee, SearchPanel } from "@/components/SharedSections";

export const metadata: Metadata = { title: "All Products" };
export const instant = false;

export default async function BearingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [products, page] = await Promise.all([getProducts(), getPage("/bearings")]);
  const content = section(page, "app/bearings/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] : "";
  return <><div className="catalogue-shell"><div className="page-width"><Breadcrumbs items={[{ label: c("copy-002", "Home"), href: "/home" }, { label: c("copy-007", "All Products") }]}/><div className="catalogue-title"><h1>{c("copy-008", "All")} <em>{c("copy-009", "Products")}</em></h1></div><Catalogue initialProducts={products} initialQuery={value("q")} initialVehicle={value("brand")} initialType={value("type")} initialInner={parseDimension(value("inner"))} initialOuter={parseDimension(value("outer"))} initialWidth={parseDimension(value("width"))}/></div></div><div className="catalogue-brand-divider page-width" aria-hidden="true"/><BrandMarquee/><SearchPanel products={products}/></>;
}
