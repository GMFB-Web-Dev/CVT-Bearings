import type { Metadata } from "next";
import { Catalogue } from "@/components/Catalogue";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProducts } from "@/lib/catalog-data";
import { parseDimension } from "@/lib/product-search";

export const metadata: Metadata = { title: "CVT Bearing Catalogue" };
export const instant = false;

export default async function BearingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const products = await getProducts();
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === "string" ? query[key] : "";
  return <div className="catalogue-shell"><div className="page-width"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "CVT Bearings Catalogue" }]}/><div className="catalogue-title"><h1>CVT bearing <em>catalogue</em></h1><p>Fixed-price bearings and specialist quote products</p></div><Catalogue initialProducts={products} initialQuery={value("q")} initialVehicle={value("brand")} initialType={value("type")} initialInner={parseDimension(value("inner"))} initialOuter={parseDimension(value("outer"))} initialWidth={parseDimension(value("width"))}/></div></div>;
}
