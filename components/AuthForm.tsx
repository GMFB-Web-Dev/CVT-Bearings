"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cvt-bearings.vercel.app").replace(
  /\/$/,
  "",
);

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function AuthForm() {
  const query = useSearchParams();
  const [signup, setSignup] = useState(query.get("mode") === "signup");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(formData: FormData) {
    const supabase = createClient();
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(formData.get("name") || "") },
            emailRedirectTo: `${SITE_URL}/account`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(signup ? "Check your email to confirm your account." : "Signed in successfully.");
    if (!signup && result.data.user) {
      window.dispatchEvent(
        new CustomEvent("cvt-authenticated", { detail: { userId: result.data.user.id } }),
      );
      router.replace(safeNextPath(query.get("next")));
      router.refresh();
    }
  }

  return (
    <div className="auth-card">
      <h1>{signup ? "Create account" : "Welcome back"}</h1>
      <p>
        {signup
          ? "Create an account to retain your cart, submit reviews and track orders."
          : "Sign in to see your CVT Bearings account."}
      </p>
      <form action={submit}>
        {signup && <label className="auth-field" htmlFor="auth-name">
          <span>Full name</span>
          <input id="auth-name" name="name" required autoComplete="name" placeholder="Your full name" />
        </label>}
        <label className="auth-field" htmlFor="auth-email">
          <span>Email address</span>
          <input id="auth-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" />
        </label>
        <label className="auth-field" htmlFor="auth-password">
          <span>Password</span>
          <input id="auth-password" name="password" type="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} placeholder="At least 8 characters" />
        </label>
        <button>{signup ? "Sign up" : "Sign in"}</button>
        {message && (
          <p className={message.includes("success") || message.includes("Check") ? "notice" : "error"}>
            {message}
          </p>
        )}
      </form>
      <button
        className="switch"
        onClick={() => {
          setSignup(!signup);
          setMessage("");
        }}
      >
        {signup ? "Already have an account? Sign in" : "New customer? Create an account"}
      </button>
    </div>
  );
}
