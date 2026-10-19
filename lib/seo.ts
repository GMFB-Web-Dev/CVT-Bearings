import type { Metadata } from "next";

const FALLBACK_ORIGIN = "https://cvt-bearings.vercel.app";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  image: string;
  imageTitle: string;
  imageAlt: string;
};

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || FALLBACK_ORIGIN).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageTitle,
  imageAlt,
}: PageMetadata): Metadata {
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "CVT Bearings",
      locale: "en_NZ",
      type: "website",
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
    other: {
      "feature-image-title": imageTitle,
    },
  };
}
