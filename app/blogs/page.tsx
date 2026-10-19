import type { Metadata } from "next";
import Link from "next/link";
import { BrandMarquee, SearchPanel, ServiceStrip } from "@/components/SharedSections";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogCatalogue } from "@/components/BlogCatalogue";
import { getProducts } from "@/lib/catalog-data";
import { getPublishedBlogPosts, toBlogListingItem } from "@/lib/blog-posts";
import { entry, getPage, section } from "@/lib/cms";
import { createPageMetadata } from "@/lib/seo";
import "./blog-listing.css";

export const metadata: Metadata = createPageMetadata({
  title: "CVT Bearing Blogs | Guides & Expert Advice NZ",
  description: "Explore CVT bearing guides, identification tips and transmission insights. Learn about bearing types, part numbers and choosing the right CVT bearings.",
  path: "/blogs",
  keywords: ["CVT Bearing Blogs", "CVT Bearing Guides", "CVT Bearing Identification", "CVT Transmission Bearings", "CVT Bearing Advice NZ"],
  image: "/assets/blog-detail.jpg",
  imageTitle: "CVT Bearing Guides, Technical Advice and Transmission Insights",
  imageAlt: "CVT transmission bearings and components featured in technical guides and informative blogs by CVT Bearings NZ",
});

export default async function BlogsPage() {
  const [page, products, posts] = await Promise.all([getPage("/blogs"), getProducts(), getPublishedBlogPosts()]);
  const content = section(page, "app/blogs/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  const listing = posts.map(toBlogListingItem);
  return <><section className="inner-hero orders-hero"><div><h1>{c("copy-002", "CVT Bearing Blogs")}</h1><p>{c("copy-003", "Practical guides on CVT bearing problems, warning signs, diagnostics, repairs and replacement.")}</p><Link href={c("copy-004", "/bearings")} className="button">{c("copy-005", "Find your bearing")}</Link></div></section><ServiceStrip/><section className="content-section"><Breadcrumbs items={[{ label: c("copy-006", "Home"), href: "/home" }, { label: c("copy-007", "Blogs") }]}/><h2>{c("copy-008", "All")} <em>{c("copy-009", "blogs")}</em></h2><BlogCatalogue initialBlogs={listing}/></section><BrandMarquee/><SearchPanel products={products}/></>;
}
