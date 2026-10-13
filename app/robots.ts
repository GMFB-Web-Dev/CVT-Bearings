import type { MetadataRoute } from "next";

const FALLBACK_ORIGIN = "https://cvt-bearings.vercel.app";

function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(configured || FALLBACK_ORIGIN).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/api/", "/cart", "/checkout/", "/login", "/login-sign-up"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
