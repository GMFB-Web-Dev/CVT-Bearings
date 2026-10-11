"use client";

import { useRef, useState } from "react";
import { submitEnquiry } from "@/lib/submit-enquiry";

export function NewsletterForm() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setStatus("");
    try {
      const email = String(formData.get("email") || "");
      await submitEnquiry({ kind: "newsletter", email, firstName: email.split("@")[0], website: String(formData.get("website") || "") });
      formRef.current?.reset();
      setStatus("Thanks — we'll be in touch.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Subscription could not be sent.");
    } finally {
      setPending(false);
    }
  }

  return <form action={submit} ref={formRef}>
    <label className="sr-only" htmlFor="newsletter-email">Email address</label>
    <input id="newsletter-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Enter your email"/>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button disabled={pending}>{pending ? "Sending…" : "Subscribe"}</button>
    {status && <small className={status.startsWith("Thanks") ? "newsletter-success" : "newsletter-error"} aria-live="polite">{status}</small>}
  </form>;
}
