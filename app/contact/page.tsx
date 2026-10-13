import type { Metadata } from "next";
import { ContactSection, ServiceStrip } from "@/components/SharedSections";
import { entry, getPage, section } from "@/lib/cms";

export const metadata: Metadata = { title: "Contact Us" };
export const instant = false;

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [query, page] = await Promise.all([searchParams, getPage("/contact")]);
  const product = typeof query.product === "string" ? query.product : "";
  const content = section(page, "app/contact/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  return <><section className="inner-hero contact-hero"><div><h1>{c("copy-002", "Contact Us")}</h1><p>{c("copy-003", "Need help finding the right CVT bearing? Get in touch with our team for help with product identification, availability or your order.")}</p><a className="button" href={c("copy-004", "#contact-form")}>{c("copy-005", "Find your bearing")}</a></div></section><ServiceStrip/><ContactSection productId={product}/></>;
}
