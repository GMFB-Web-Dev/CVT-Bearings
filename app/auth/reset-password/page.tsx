import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { clearPasswordRecovery, hasPasswordRecovery } from "@/lib/supabase/password-recovery";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset your password | CVT Bearings",
  robots: { index: false, follow: false },
};

const requestNewLink = "/login-sign-up?mode=forgot&auth=invalid-link";

async function getRecoveryClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return await hasPasswordRecovery(data?.claims.session_id) ? supabase : null;
}

async function resetPassword(formData: FormData) {
  "use server";

  const supabase = await getRecoveryClient();
  if (!supabase) redirect(requestNewLink);

  const password = formData.get("password");
  const confirm = formData.get("confirm");
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    redirect("/auth/reset-password?status=length");
  }
  if (password !== confirm) redirect("/auth/reset-password?status=mismatch");

  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === "same_password") redirect("/auth/reset-password?status=same-password");
  if (error) redirect("/auth/reset-password?status=failed");

  await clearPasswordRecovery();
  await supabase.auth.signOut();
  redirect("/login-sign-up?auth=password-updated");
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!await getRecoveryClient()) redirect(requestNewLink);

  const { status } = await searchParams;
  const error = status === "length" ? "Use between 8 and 128 characters."
    : status === "mismatch" ? "The two passwords must match."
    : status === "same-password" ? "Choose a password different from your current password."
    : status === "failed" ? "Couldn’t update your password. Try again or request a new link."
    : null;

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p>Choose a new password for your CVT Bearings account.</p>
        <form action={resetPassword}>
          <label className="auth-field" htmlFor="reset-password">
            <span>New password</span>
            <input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          </label>
          <label className="auth-field" htmlFor="reset-password-confirm">
            <span>Confirm new password</span>
            <input id="reset-password-confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          </label>
          <button type="submit">Update password</button>
          {error && <p role="status" className="error">{error}</p>}
        </form>
        <Link className="switch" href="/login-sign-up?mode=forgot">Request a new reset link</Link>
      </div>
    </section>
  );
}
