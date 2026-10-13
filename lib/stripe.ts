import "server-only";

import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
export const STRIPE_INTEGRATION_IDENTIFIER = "cvt_checkout_qzmtpkra";

let stripeClient: Stripe | null = null;
let nzGstTaxRateId: string | null = null;

// This is a non-secret Stripe resource identifier for the existing CVT Bearings
// sandbox rate. Production should still provide STRIPE_NZ_GST_TAX_RATE_ID, but
// validating this known rate keeps checkout working if Vercel drops that value
// from a deployment. The account lookup also supports a separately configured
// live-mode 15% inclusive NZ GST rate.
const EXISTING_NZ_GST_TAX_RATE_ID = "txr_1UPtZrLFLBPBdArDnifrFnb0";

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

function isNzGstRate(rate: Stripe.TaxRate) {
  return rate.active
    && rate.inclusive
    && rate.percentage === 15
    && rate.country === "NZ";
}

export async function getNzGstTaxRateId(stripe: Stripe) {
  const configured = process.env.STRIPE_NZ_GST_TAX_RATE_ID?.trim();
  if (configured) return configured;
  if (nzGstTaxRateId) return nzGstTaxRateId;

  try {
    const existing = await stripe.taxRates.retrieve(EXISTING_NZ_GST_TAX_RATE_ID);
    if (isNzGstRate(existing)) {
      nzGstTaxRateId = existing.id;
      return nzGstTaxRateId;
    }
  } catch {
    // The known sandbox rate is intentionally unavailable to live-mode keys.
  }

  const rates = await stripe.taxRates.list({ active: true, limit: 100 });
  const matchingRate = rates.data.find(isNzGstRate);
  if (!matchingRate) {
    throw new Error("No active inclusive 15% NZ GST tax rate is configured in Stripe.");
  }

  nzGstTaxRateId = matchingRate.id;
  return nzGstTaxRateId;
}

export function getSiteUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (request) return new URL(request.url).origin;
  return "http://localhost:3001";
}
