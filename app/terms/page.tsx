import { LegalPage } from "@/components/LegalPage";
import { entry, getPage, section } from "@/lib/cms";

export default async function TermsPage() {
  const page = await getPage("/terms");
  const content = section(page, "app/terms/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  return <LegalPage title={c("copy-001", "Terms of Service")}><h2>{c("copy-002", "Using this website")}</h2><p>{c("copy-003", "Product information is provided to help you identify suitable CVT bearings and related parts.")}</p><h2>{c("copy-004", "Pricing and orders")}</h2><p>{c("copy-005", "Prices are shown in New Zealand dollars. Products marked “Price on request” require a confirmed quote.")}</p><h2>{c("copy-006", "Returns and warranties")}</h2><p>{c("copy-007", "Returns are subject to the Shipping & Returns policy and applicable New Zealand consumer law.")}</p></LegalPage>;
}
