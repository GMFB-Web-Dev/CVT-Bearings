"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const modes = {
  signIn: {
    title: "Welcome back",
    description: "Sign in to see your CVT Bearings account.",
    button: "Sign in",
  },
  signup: {
    title: "Create account",
    description: "Create an account to retain your cart, submit reviews and track orders.",
    button: "Sign up",
  },
  forgot: {
    title: "Forgot your password?",
    description: "Enter your email address to request a password reset link.",
    button: "Send reset link",
  },
  resend: {
    title: "Confirm your account",
    description: "Enter the email address you signed up with to request another confirmation link.",
    button: "Resend confirmation",
  },
};

type Mode = keyof typeof modes;
type Message = { text: string; error?: boolean };

const checkConfirmation: Message = {
  text: "If this address needs confirmation, a link will be sent. Check your inbox and spam folder.",
};
const checkRecovery: Message = {
  text: "If this address can receive a password reset email, a link will be sent. Check your inbox and spam folder.",
};

export function AuthForm() {
  const query = useSearchParams();
  const requestedMode = query.get("mode");
  const [mode, setMode] = useState<Mode>(
    requestedMode === "signup" || requestedMode === "forgot" || requestedMode === "resend"
      ? requestedMode
      : "signIn",
  );
  const [message, setMessage] = useState<Message | null>(() => {
    switch (query.get("auth")) {
      case "invalid-link":
        return { text: "This link is invalid or has expired. Request a new one below.", error: true };
      case "password-updated":
        return { text: "Your password has been updated. Sign in with your new password." };
      default:
        return null;
    }
  });
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { title, description, button } = modes[mode];
  const needsPassword = mode === "signIn" || mode === "signup";

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmationUrl = new URL("/auth/confirm", window.location.origin).href;

    setMessage(null);
    setPending(true);
    try {
      const supabase = createClient();

      if (mode === "forgot") {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: confirmationUrl });
        setMessage(checkRecovery);
        return;
      }

      if (mode === "resend") {
        await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: confirmationUrl },
        });
        setMessage(checkConfirmation);
        return;
      }

      const name = String(formData.get("name") ?? "").trim();
      const { data, error } = mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name, first_name: name.split(/\s+/)[0] },
              emailRedirectTo: confirmationUrl,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (data.session && data.user && !error) {
        window.dispatchEvent(
          new CustomEvent("cvt-authenticated", { detail: { userId: data.user.id } }),
        );
        const next = query.get("next") ?? "/";
        router.replace(["/", "/cart", "/account", "/account#wishlist"].includes(next) ? next : "/");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        setMessage(error?.code === "weak_password"
          ? { text: "Choose a stronger password and try again.", error: true }
          : checkConfirmation);
        return;
      }

      setMessage({
        text: "Couldn’t sign you in. Check your email and password, or confirm your account if you recently signed up.",
        error: true,
      });
    } catch {
      setMessage({
        text: "The account service is temporarily unavailable. Please try again.",
        error: true,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>{title}</h1>
      <p>{description}</p>
      <form method="post" onSubmit={submit}>
        {mode === "signup" && (
          <label className="auth-field" htmlFor="auth-name">
            <span>Full name</span>
            <input id="auth-name" name="name" required autoComplete="name" placeholder="Your full name" />
          </label>
        )}
        <label className="auth-field" htmlFor="auth-email">
          <span>Email address</span>
          <input id="auth-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" />
        </label>
        {needsPassword && (
          <label className="auth-field" htmlFor="auth-password">
            <span>Password</span>
            <input
              key={mode}
              id="auth-password"
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            />
          </label>
        )}
        <button type="submit" disabled={pending}>{pending ? "Please wait…" : button}</button>
        {message && <p className={message.error ? "error" : "notice"} role="status">{message.text}</p>}
      </form>
      <div>
        <button type="button" className="switch" disabled={pending} onClick={() => changeMode(mode === "signIn" ? "signup" : "signIn")}>
          {mode === "signIn" ? "New customer? Create an account" : "Back to sign in"}
        </button>
      </div>
      {mode === "signIn" && (
        <div>
          <button type="button" className="switch" disabled={pending} onClick={() => changeMode("forgot")}>
            Forgot your password?
          </button>
        </div>
      )}
      {(mode === "signIn" || mode === "signup") && (
        <div>
          <button type="button" className="switch" disabled={pending} onClick={() => changeMode("resend")}>
            Resend confirmation email
          </button>
        </div>
      )}
    </div>
  );
}
