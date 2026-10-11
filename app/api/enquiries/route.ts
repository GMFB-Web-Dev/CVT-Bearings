import { createElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import { BusinessEnquiryEmail, type BusinessEnquiryEmailProps } from "@/emails/BusinessEnquiryEmail";
import { createClient } from "@/lib/supabase/server";
import { SITE_KEY } from "@/lib/catalog";

type EnquiryKind = BusinessEnquiryEmailProps["kind"];
type IncomingEnquiry = {
  kind?: EnquiryKind;
  requestId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  productId?: string;
  productTitle?: string;
  productSku?: string;
  company?: string;
  quantity?: string;
  vehicle?: string;
  transmissionCode?: string;
  bearingDetails?: string;
  website?: string;
};

const requestWindows = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const existing = requestWindows.get(ip);
  if (!existing || existing.resetAt <= now) {
    requestWindows.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  existing.count += 1;
  return existing.count > 6;
}

function subjectFor(kind: EnquiryKind, productTitle: string, name: string) {
  if (kind === "quote") return `Quote request${productTitle ? `: ${productTitle}` : ""}`.slice(0, 140);
  if (kind === "newsletter") return `Newsletter signup: ${name}`.slice(0, 140);
  return `Website enquiry from ${name}`.slice(0, 140);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) return Response.json({ error: "Too many enquiries. Please wait a few minutes and try again." }, { status: 429 });

  let incoming: IncomingEnquiry;
  try {
    incoming = await request.json() as IncomingEnquiry;
  } catch {
    return Response.json({ error: "Invalid enquiry." }, { status: 400 });
  }

  if (clean(incoming.website, 100)) return Response.json({ ok: true });

  const kind: EnquiryKind = ["contact", "quote", "newsletter"].includes(incoming.kind || "") ? incoming.kind! : "contact";
  const firstName = clean(incoming.firstName, 80);
  const lastName = clean(incoming.lastName, 80);
  const name = `${firstName} ${lastName}`.trim() || "Website visitor";
  const email = clean(incoming.email, 254).toLowerCase();
  const phone = clean(incoming.phone, 40);
  const service = clean(incoming.service, 100) || (kind === "quote" ? "Product quote" : kind === "newsletter" ? "Newsletter signup" : "General enquiry");
  const message = clean(incoming.message, 4000);
  const productId = clean(incoming.productId, 120);
  const productTitle = clean(incoming.productTitle, 180);
  const productSku = clean(incoming.productSku, 120);
  const requestId = clean(incoming.requestId, 80) || crypto.randomUUID();

  if (!isEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (kind !== "newsletter" && (!firstName || !lastName)) return Response.json({ error: "Enter your first and last name." }, { status: 400 });
  if (kind === "contact" && !message) return Response.json({ error: "Tell us how we can help." }, { status: 400 });
  if (kind === "quote" && !productTitle) return Response.json({ error: "The product information is missing. Please reload and try again." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BUSINESS_ENQUIRY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "CVT Bearings <enquiries@weblaunch.co.nz>";
  if (!apiKey || !to) return Response.json({ error: "Email delivery is not configured yet. Please call 0800 288 695." }, { status: 503 });

  const fields = kind === "quote" ? [
    { label: "Company", value: clean(incoming.company, 140) },
    { label: "Quantity", value: clean(incoming.quantity, 12) || "1" },
    { label: "Vehicle", value: clean(incoming.vehicle, 180) },
    { label: "Transmission code", value: clean(incoming.transmissionCode, 120) },
    { label: "Bearing markings / dimensions", value: clean(incoming.bearingDetails, 500) },
    { label: "Notes", value: message },
  ] : kind === "contact" ? [{ label: "Message", value: message }] : [];

  const emailProps: BusinessEnquiryEmailProps = { kind, name, email, phone, service, productTitle, productSku, fields };
  const emailComponent = createElement(BusinessEnquiryEmail, emailProps);
  const [html, text] = await Promise.all([
    render(emailComponent),
    render(emailComponent, { plainText: true }),
  ]);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: subjectFor(kind, productTitle, name),
    html,
    text,
  }, { idempotencyKey: `cvt-enquiry-${requestId}` });

  if (error) {
    console.error("Resend enquiry failed", { name: error.name, message: error.message });
    return Response.json({ error: "We couldn't send that yet. Please call 0800 288 695." }, { status: 502 });
  }

  if (kind !== "newsletter") {
    try {
      const supabase = await createClient();
      await supabase.from("enquiries").insert({
        site_key: SITE_KEY,
        product_id: productId || null,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        service,
        message: kind === "quote" ? fields.map((field) => `${field.label}: ${field.value || "—"}`).join("\n") : message,
      });
    } catch (databaseError) {
      console.error("Supabase enquiry archive failed", databaseError);
    }
  }

  return Response.json({ ok: true });
}
