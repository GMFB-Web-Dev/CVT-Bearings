import type { Metadata } from "next";
import { Catalogue } from "@/components/Catalogue";
import { products } from "@/lib/catalog";

export const metadata: Metadata = { title: "CVT Bearing Catalogue" };
export const instant = false;

export default async function BearingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return <div className="catalogue-shell"><div className="page-width"><div className="breadcrumbs">Home / CVT Bearings Catalogue</div><div className="catalogue-title"><h1>CVT bearing <em>catalogue</em></h1><p>Fixed-price bearings and specialist quote products</p></div><Catalogue initialProducts={products} initialQuery={typeof query.q === "string" ? query.q : ""}/></div></div>;
}
