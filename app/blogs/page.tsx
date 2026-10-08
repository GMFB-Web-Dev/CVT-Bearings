import type { Metadata } from "next";
import Link from "next/link";
import { BrandMarquee, SearchPanel, ServiceStrip } from "@/components/SharedSections";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogCatalogue } from "@/components/BlogCatalogue";

export const metadata: Metadata = { title: "CVT Bearing Blogs" };
export default function BlogsPage(){return <><section className="inner-hero orders-hero"><div><h1>CVT Bearing Blogs</h1><p>Practical guides on CVT bearing problems, warning signs, diagnostics, repairs and replacement.</p><Link href="/bearings" className="button">Find your bearing</Link></div></section><ServiceStrip/><section className="content-section"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blogs" }]}/><h2>All <em>blogs</em></h2><BlogCatalogue/></section><BrandMarquee/><SearchPanel/></>}
