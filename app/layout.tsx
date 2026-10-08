import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./legal.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CVT Bearings NZ", template: "%s | CVT Bearings NZ" },
  description: "New Zealand CVT bearing specialists. Search by bearing, transmission, vehicle and dimensions.",
};

// Auth-aware cart state and request-time search parameters are allowed to block.
export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body><CartProvider><Header/><main>{children}</main><Footer/><CartDrawer/></CartProvider></body>
    </html>
  );
}
