import { LegalPage } from "@/components/LegalPage";
import { entry, getPage, section } from "@/lib/cms";

export default async function CookiesPage() {
  const page = await getPage("/cookies");
  const content = section(page, "app/cookies/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);
  return <LegalPage title={c("copy-001", "Cookie Settings")}><h2>{c("copy-002", "Essential storage")}</h2><p>{c("copy-003", "This website uses essential browser storage to keep your shopping cart and signed-in session working.")}</p><h2>{c("copy-004", "Preferences and analytics")}</h2><p>{c("copy-005", "No optional advertising cookies are enabled in this build.")}</p></LegalPage>;
}
