import type { Metadata } from "next";
import { ContactSection, ServiceStrip } from "@/components/SharedSections";

export const metadata: Metadata = { title: "Contact Us" };
export const instant = false;
export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams; const product = typeof query.product === "string" ? query.product : "";
  return <><section className="inner-hero contact-hero"><div><h1>Contact Us</h1><p>Need help finding the right CVT bearing? Get in touch with our team for help with product identification, availability or your order.</p><a className="button" href="#contact-form">Find your bearing</a></div></section><ServiceStrip/><ContactSection productId={product}/></>;
}
