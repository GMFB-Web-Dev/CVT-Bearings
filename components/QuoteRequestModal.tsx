"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { submitEnquiry } from "@/lib/submit-enquiry";

export function QuoteRequestModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  async function submit(formData: FormData) {
    setPending(true);
    setStatus("");
    try {
      await submitEnquiry({
        kind: "quote",
        productId: product.id,
        productTitle: product.title,
        productSku: product.sku || product.manufacturer_part_number || product.id,
        firstName: String(formData.get("first_name") || ""),
        lastName: String(formData.get("last_name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        company: String(formData.get("company") || ""),
        quantity: String(formData.get("quantity") || "1"),
        vehicle: String(formData.get("vehicle") || ""),
        transmissionCode: String(formData.get("transmission_code") || ""),
        bearingDetails: String(formData.get("bearing_details") || ""),
        message: String(formData.get("message") || ""),
        website: String(formData.get("website") || ""),
      });
      formRef.current?.reset();
      setStatus("Thanks — your quote request has been emailed to our team.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We couldn't send that yet. Please call 0800 288 695.");
    } finally {
      setPending(false);
    }
  }

  return <div className="quote-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
      <button className="quote-modal-close" type="button" onClick={onClose} aria-label="Close quote request"><X/></button>
      <header>
        <span>REQUEST A QUOTE</span>
        <h2 id="quote-modal-title">Tell us what you need</h2>
        <p>Share as much fitment information as you have. Our CVT team will confirm availability, compatibility and pricing.</p>
      </header>
      <div className="quote-product"><small>Product</small><strong>{product.title}</strong><span>Item no. {product.sku || product.manufacturer_part_number || product.id}</span></div>
      <form className="quote-form" action={submit} ref={formRef}>
        <div className="field"><label htmlFor="quote-first-name">First name</label><input id="quote-first-name" name="first_name" required maxLength={80} autoComplete="given-name" autoFocus/></div>
        <div className="field"><label htmlFor="quote-last-name">Last name</label><input id="quote-last-name" name="last_name" required maxLength={80} autoComplete="family-name"/></div>
        <div className="field"><label htmlFor="quote-email">Email</label><input id="quote-email" name="email" type="email" required maxLength={254} autoComplete="email"/></div>
        <div className="field"><label htmlFor="quote-phone">Phone</label><input id="quote-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel"/></div>
        <div className="field"><label htmlFor="quote-company">Company (optional)</label><input id="quote-company" name="company" maxLength={140} autoComplete="organization"/></div>
        <div className="field"><label htmlFor="quote-quantity">Quantity</label><input id="quote-quantity" name="quantity" type="number" min="1" max="999" defaultValue="1" required/></div>
        <div className="field full"><label htmlFor="quote-vehicle">Vehicle year, make and model</label><input id="quote-vehicle" name="vehicle" maxLength={180} placeholder="e.g. 2015 Honda Fit"/></div>
        <div className="field"><label htmlFor="quote-transmission">Transmission code</label><input id="quote-transmission" name="transmission_code" maxLength={120} placeholder="If known"/></div>
        <div className="field"><label htmlFor="quote-bearing">Bearing markings / dimensions</label><input id="quote-bearing" name="bearing_details" maxLength={500} placeholder="Part number or ID × OD × width"/></div>
        <div className="field full"><label htmlFor="quote-message">Anything else we should know?</label><textarea id="quote-message" name="message" maxLength={4000} placeholder="Transmission symptoms, required date, delivery location or other notes"/></div>
        <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <label className="quote-consent terms-consent full"><input type="checkbox" required/> <span>I agree to the terms and conditions</span></label>
        <div className="quote-submit full"><button className="button" disabled={pending}><Send/>{pending ? "Sending…" : "Send quote request"}</button>{status && <p className={status.startsWith("Thanks") ? "notice" : "error"} aria-live="polite">{status}</p>}</div>
      </form>
    </section>
  </div>;
}
