import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Catalogue } from "@/components/Catalogue";
import { sectionProducts } from "@/lib/catalog";

const titles: Record<string, string> = { "main-bearing-kits": "Main Bearing Kits", "pulley-bearings": "Pulley Bearings", "primary-pulley-bearings": "Primary Pulley Bearings" };
export const instant = false;
export function generateStaticParams() { return Object.keys(titles).map((section) => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> { const { section } = await params; return { title: titles[section] || "Bearings" }; }

export default async function BearingSection({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { section } = await params; const query = await searchParams; if (!titles[section]) notFound();
  const products = sectionProducts(section);
  return <div className="catalogue-shell"><div className="page-width"><div className="breadcrumbs">Home / Bearings / {titles[section]}</div><div className="catalogue-title"><h1>{titles[section]}</h1><p>Search by tag, vehicle, make and bearing type</p></div><Catalogue initialProducts={products.length ? products : sectionProducts()} initialQuery={typeof query.q === "string" ? query.q : ""}/></div></div>;
}
