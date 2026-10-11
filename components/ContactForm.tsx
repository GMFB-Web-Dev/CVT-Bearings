"use client";

import { useRef, useState } from "react";
import { submitEnquiry } from "@/lib/submit-enquiry";

export function ContactForm({ productId = "" }: { productId?: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(formData: FormData) {
    setMessage("Sending…");
    setPending(true);
    try {
      await submitEnquiry({
        kind: "contact",
        productId,
        firstName: String(formData.get("first_name") || ""),
        lastName: String(formData.get("last_name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        service: String(formData.get("service") || "General enquiry"),
        message: String(formData.get("message") || ""),
        website: String(formData.get("website") || ""),
      });
      formRef.current?.reset();
      setMessage("Thanks — your enquiry has been emailed to our team.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't send that yet. Please call 0800 288 695.");
    } finally {
      setPending(false);
    }
  }
  return <form className="form-grid" action={submit} ref={formRef}>
    <div className="field"><label htmlFor="contact-first-name">First name</label><input id="contact-first-name" name="first_name" required maxLength={80} autoComplete="given-name" placeholder="First Name"/></div>
    <div className="field"><label htmlFor="contact-last-name">Last name</label><input id="contact-last-name" name="last_name" required maxLength={80} autoComplete="family-name" placeholder="Last Name"/></div>
    <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email"/></div>
    <div className="field"><label htmlFor="contact-phone">Phone</label><input id="contact-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+64 21 345 6789"/></div>
    <div className="field full"><label htmlFor="contact-service">Select a service</label><select id="contact-service" name="service" defaultValue={productId ? "Product enquiry" : "General enquiry"}><option>General enquiry</option><option>Product enquiry</option><option>Bulk order</option><option>Shipping & returns</option><option>Order & payment</option></select></div>
    <div className="field full"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required maxLength={4000} placeholder={productId ? `Please quote product ${productId}` : "Type your message here…"}/></div>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="field full"><span><input type="checkbox" required/> I agree to the terms and conditions</span></label>
    <div className="field full"><button className="button" disabled={pending}>{pending ? "Sending…" : "Submit"}</button>{message && <p aria-live="polite" className={message.startsWith("Thanks") ? "notice" : message === "Sending…" ? "" : "error"}>{message}</p>}</div>
  </form>;
}
