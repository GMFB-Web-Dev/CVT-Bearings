import "server-only";

import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
export const STRIPE_INTEGRATION_IDENTIFIER = "cvt_checkout_qzmtpkra";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: "CVT Bearings storefront",
      version: "1.0.0",
      url: "https://cvt-bearings.vercel.app",
    },
  });

  return stripeClient;
}

export function getSiteUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (request) return new URL(request.url).origin;
  return "http://localhost:3001";
}
