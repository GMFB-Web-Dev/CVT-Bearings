import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./legal.css";
import "./cms.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CmsProvider } from "@/components/CmsProvider";
import { assetURL, getNavigation, getSiteSettings } from "@/lib/cms";
import type { CSSProperties } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: { default: settings?.defaultSEO?.title || "CVT Bearings NZ", template: `%s | ${settings?.businessName || "CVT Bearings NZ"}` },
    description: settings?.defaultSEO?.description || "New Zealand CVT bearing specialists. Search by bearing, transmission, vehicle and dimensions.",
  };
}

// Auth-aware cart state and request-time search parameters are allowed to block.
export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);
  const backgrounds = {
    "--cms-hero": `url("${assetURL(settings, "assets/hero.jpg", "/assets/hero.jpg")}")`,
    "--cms-facility": `url("${assetURL(settings, "assets/facility.png", "/assets/facility.png")}")`,
    "--cms-transmission": `url("${assetURL(settings, "assets/transmission.jpg", "/assets/transmission.jpg")}")`,
    "--cms-about-hero": `url("${assetURL(settings, "assets/about-hero.jpg", "/assets/about-hero.jpg")}")`,
    "--cms-contact-hero": `url("${assetURL(settings, "assets/contact-hero.jpg", "/assets/contact-hero.jpg")}")`,
    "--cms-shipping-hero": `url("${assetURL(settings, "assets/shipping-hero.jpg", "/assets/shipping-hero.jpg")}")`,
  } as CSSProperties;
  return (
    <html
      lang="en"
      className={`${geistSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body style={backgrounds}><CmsProvider settings={settings} navigation={navigation}><CartProvider><Header/><main>{children}</main><Footer/><CartDrawer/></CartProvider></CmsProvider></body>
    </html>
  );
}
