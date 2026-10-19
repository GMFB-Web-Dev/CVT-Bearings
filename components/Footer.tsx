"use client";

import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useCms } from "@/components/CmsProvider";

export function Footer() {
  const { copy, asset, settings, navigation } = useCms();
  const c = (key: string, fallback: string) => copy("components/Footer.tsx", key, fallback);
  const footerLabel = (url: string, fallback: string) => navigation?.footerLinks?.find((item) => item.url === url)?.label || fallback;
  const footerLinks = navigation?.footerLinks || [];
  const customerCare = footerLinks.slice(2, 7).length ? footerLinks.slice(2, 7) : [{ label: c("copy-010", "Shipping & Returns"), url: c("copy-009", "/shipping-and-returns") }, { label: c("copy-012", "Sign in"), url: c("copy-011", "/login-sign-up") }, { label: c("copy-014", "Sign up"), url: c("copy-013", "/login-sign-up?mode=signup") }, { label: c("copy-016", "Wishlist"), url: c("copy-015", "/account") }, { label: c("copy-018", "Cart"), url: c("copy-017", "/cart") }];
  const pages = footerLinks.slice(7, 12).length ? footerLinks.slice(7, 12) : [{ label: c("copy-021", "Home"), url: c("copy-020", "/home") }, { label: c("copy-023", "About us"), url: c("copy-022", "/about-us") }, { label: c("copy-025", "Bearings"), url: c("copy-024", "/bearings") }, { label: c("copy-027", "Blogs"), url: c("copy-026", "/blogs") }, { label: c("copy-029", "Contact us"), url: c("copy-028", "/contact") }];
  const company = footerLinks.slice(12, 15).length ? footerLinks.slice(12, 15) : [{ label: c("copy-032", "CVT NZ"), url: c("copy-031", "https://cvtnz.co.nz") }, { label: c("copy-034", "CVT Parts"), url: c("copy-033", "https://cvt-parts.co.nz") }, { label: c("copy-036", "CVT Bearings"), url: c("copy-035", "/home") }];
  return <footer className="footer"><div className="footer-grid page-width">
    <div className="footer-brand"><Image src={asset("assets/logo.png", "/assets/logo.png")} width={235} height={64} alt={c("copy-001", "CVT Bearings")} unoptimized/><p><b>{c("copy-002", "Auckland:")}</b><br/><a href={settings?.contact?.mapLink || c("copy-003", "https://maps.google.com/?q=125+State+Highway+5+Tirau")}>{footerLabel(settings?.contact?.mapLink || "", c("copy-004", "State Highway 5, Tirau 3485"))}</a></p><p><b>{c("copy-005", "Phone:")}</b><br/><a href={settings?.contact?.phoneHref || c("copy-006", "tel:0800288695")}>{settings?.contact?.phoneDisplay || c("copy-007", "0800 288 695")}</a></p></div>
    <div><h4>{c("copy-008", "Customer Care")}</h4>{customerCare.map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</div>
    <div><h4>{c("copy-019", "Pages")}</h4>{pages.map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</div>
    <div><h4>{c("copy-030", "Company")}</h4>{company.map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</div>
    <div className="newsletter"><h4>{c("copy-037", "Join Our Newsletter")}</h4><NewsletterForm/></div>
  </div><div className="footer-bottom page-width"><Image className="payment-logos" src={asset("assets/payment-logos.png", "/assets/payment-logos.png")} width={694} height={71} alt={c("copy-038", "Accepted payment methods: Amazon Pay, American Express, Apple Pay, Discover, Mastercard, PayPal, Visa, Afterpay and Google Pay")}/><div><small>{settings?.footer?.copyright || c("copy-039", "© 2026 Developed by GMFB Ltd. All rights reserved.")}</small><nav>{(settings?.footer?.legalLinks || [{label:c("copy-041", "Privacy Policy"),url:c("copy-040", "/privacy")},{label:c("copy-043", "Terms of Service"),url:c("copy-042", "/terms")},{label:c("copy-045", "Cookies Settings"),url:c("copy-044", "/cookies")}]).map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</nav></div></div></footer>;
}
