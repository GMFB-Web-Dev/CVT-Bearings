import type { Metadata } from "next";
import Link from "next/link";
import { BrandMarquee, SearchPanel, ServiceStrip } from "@/components/SharedSections";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogCatalogue } from "@/components/BlogCatalogue";
import { getProducts } from "@/lib/catalog-data";
import { blogSummaries, entry, getPage, getSiteSettings, section } from "@/lib/cms";

export const metadata: Metadata = { title: "CVT Bearing Blogs" };

export default async function BlogsPage() {
  const [page, settings, products] = await Promise.all([getPage("/blogs"), getSiteSettings(), getProducts()]);
  const content = section(page, "app/blogs/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  return <><section className="inner-hero orders-hero"><div><h1>{c("copy-002", "CVT Bearing Blogs")}</h1><p>{c("copy-003", "Practical guides on CVT bearing problems, warning signs, diagnostics, repairs and replacement.")}</p><Link href={c("copy-004", "/bearings")} className="button">{c("copy-005", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section"><Breadcrumbs items={[{ label: c("copy-006", "Home"), href: "/" }, { label: c("copy-007", "Blogs") }]}/><h2>{c("copy-008", "All")} <em>{c("copy-009", "blogs")}</em></h2><BlogCatalogue initialBlogs={blogSummaries(settings)}/></section><BrandMarquee/><SearchPanel products={products}/></>;
}
