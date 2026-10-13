"use client";

import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useCms } from "@/components/CmsProvider";

export function Footer() {
  const { copy, asset, settings, navigation } = useCms();
  const c = (key: string, fallback: string) => copy("components/Footer.tsx", key, fallback);
  const footerLabel = (url: string, fallback: string) => navigation?.footerLinks?.find((item) => item.url === url)?.label || fallback;
  return <footer className="footer"><div className="footer-grid page-width">
    <div className="footer-brand"><Image src={asset("assets/logo.png", "/assets/logo.png")} width={235} height={64} alt={c("copy-001", "CVT Bearings")} unoptimized/><p><b>{c("copy-002", "Auckland:")}</b><br/><a href={settings?.contact?.mapLink || c("copy-003", "https://maps.google.com/?q=125+State+Highway+5+Tirau")}>{footerLabel(settings?.contact?.mapLink || "", c("copy-004", "State Highway 5, Tirau 3485"))}</a></p><p><b>{c("copy-005", "Phone:")}</b><br/><a href={settings?.contact?.phoneHref || c("copy-006", "tel:0800288695")}>{settings?.contact?.phoneDisplay || c("copy-007", "0800 288 695")}</a></p></div>
    <div><h4>Customer Care</h4><Link href="/shipping-returns">Shipping & Returns</Link><Link href="/login-sign-up">Sign in</Link><Link href="/login-sign-up?mode=signup">Sign up</Link><Link href="/account">Wishlist</Link><Link href="/cart">Cart</Link></div>
    <div><h4>Pages</h4><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/bearings">Bearings</Link><Link href="/blogs">Blogs</Link><Link href="/contact">Contact us</Link></div>
    <div><h4>Company</h4><a href="https://cvtnz.co.nz">CVT NZ</a><a href="https://cvt-parts.co.nz">CVT Parts</a><Link href="/">CVT Bearings</Link></div>
    <div className="newsletter"><h4>Join Our Newsletter</h4><NewsletterForm/></div>
  </div><div className="footer-bottom page-width"><Image className="payment-logos" src={asset("assets/payment-logos.png", "/assets/payment-logos.png")} width={694} height={71} alt={c("copy-038", "Accepted payment methods: Amazon Pay, American Express, Apple Pay, Discover, Mastercard, PayPal, Visa, Afterpay and Google Pay")}/><div><small>{settings?.footer?.copyright || c("copy-039", "© 2026 Developed by GMFB Ltd. All rights reserved.")}</small><nav>{(settings?.footer?.legalLinks || [{label:c("copy-041", "Privacy Policy"),url:c("copy-040", "/privacy")},{label:c("copy-043", "Terms of Service"),url:c("copy-042", "/terms")},{label:c("copy-045", "Cookies Settings"),url:c("copy-044", "/cookies")}]).map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</nav></div></div></footer>;
}
