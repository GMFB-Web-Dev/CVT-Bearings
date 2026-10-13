import { LegalPage } from "@/components/LegalPage";
import { entry, getPage, section } from "@/lib/cms";

export default async function PrivacyPage() {
  const page = await getPage("/privacy");
  const content = section(page, "app/privacy/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  return <LegalPage title={c("copy-001", "Privacy Policy")}><h2>{c("copy-002", "How we handle your information")}</h2><p>{c("copy-003", "CVT Bearings collects the details needed to answer enquiries, manage accounts, maintain carts, process orders, and publish verified product reviews.")}</p><h2>{c("copy-004", "Storage and access")}</h2><p>{c("copy-005", "Account, cart, order, enquiry, and review data is stored in our secured storefront database.")}</p><h2>{c("copy-006", "Your choices")}</h2><p>{c("copy-007", "You may ask us to correct or remove personal information by emailing")} <a href={c("copy-008", "mailto:info@cvt.co.nz")}>{c("copy-009", "info@cvt.co.nz")}</a>{c("copy-010", ". We may retain records where required for legal, fraud-prevention, or accounting purposes.")}</p></LegalPage>;
}
