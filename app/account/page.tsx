import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Account" };

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect("/login-sign-up?next=%2Faccount%23wishlist");
  }

  return (
    <section className="account-page">
      <div className="page-width">
        <AccountPanel />
      </div>
    </section>
  );
}
