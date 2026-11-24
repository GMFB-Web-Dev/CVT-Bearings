import "server-only";

import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
export const STRIPE_INTEGRATION_IDENTIFIER = "cvt_checkout_qzmtpkra";

const stripeClients = new Map<boolean, Stripe>();
let nzGstTaxRateId: string | null = null;

// This is a non-secret Stripe resource identifier for the existing CVT Bearings
// sandbox rate. Production should still provide STRIPE_NZ_GST_TAX_RATE_ID, but
// validating this known rate keeps checkout working if Vercel drops that value
// from a deployment. The account lookup also supports a separately configured
// live-mode 15% inclusive NZ GST rate.
const EXISTING_NZ_GST_TAX_RATE_ID = "txr_1UPtZrLFLBPBdArDnifrFnb0";

function managedLiveEnabled() {
  return process.env.VERCEL_ENV === "production" && Boolean(process.env.STRIPE_LIVE_WEBHOOK_SECRET?.trim());
}

export function getStripeConfig(legacySandbox = false) {
  const managedLive = !legacySandbox && managedLiveEnabled();
  const secretKey = managedLive
    ? process.env.STRIPE_SECRET_KEY_STRIPE_SECRET_KEY?.trim()
    : process.env.STRIPE_SECRET_KEY?.trim();
  const isTestMode = /^(?:sk|rk)_test_/.test(secretKey ?? "");
  if (!secretKey || (legacySandbox && !isTestMode)) throw new Error("Stripe API key is not configured.");
  if (managedLive && !/^(?:sk|rk)_live_/.test(secretKey)) {
    throw new Error("The Vercel Stripe integration is missing its live API key.");
  }

  return {
    secretKey,
    managedLive,
    isTestMode,
    webhookSecret: (managedLive ? process.env.STRIPE_LIVE_WEBHOOK_SECRET : process.env.STRIPE_WEBHOOK_SECRET)?.trim(),
    shippingRateId: (managedLive ? process.env.STRIPE_LIVE_NZ_SHIPPING_RATE_ID : process.env.STRIPE_NZ_SHIPPING_RATE_ID)?.trim(),
    gstRateId: (managedLive ? process.env.STRIPE_LIVE_NZ_GST_TAX_RATE_ID : process.env.STRIPE_NZ_GST_TAX_RATE_ID)?.trim(),
  };
}

export function constructStripeWebhookEvent(body: string, signature: string, config: ReturnType<typeof getStripeConfig>) {
  if (!config.webhookSecret) throw new Error("Stripe webhook signing secret is not configured.");
  const stripe = getStripe(config);
  const event = stripe.webhooks.constructEvent(body, signature, config.webhookSecret);
  if (event.livemode === config.isTestMode) throw new Error("Stripe webhook event mode does not match its configuration.");
  return { stripe, event };
}

export function getStripe(config = getStripeConfig()) {
  const existing = stripeClients.get(config.managedLive);
  if (existing) return existing;

  const stripe = new Stripe(config.secretKey, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: {
      name: "CVT Bearings storefront",
      version: "1.0.0",
      url: "https://www.cvtbearings.co.nz",
    },
  });
  stripeClients.set(config.managedLive, stripe);
  return stripe;
}

export function getStripeForCheckoutSession(sessionId: string) {
  return getStripe(getStripeConfig(managedLiveEnabled() && sessionId.startsWith("cs_test_")));
}

function isNzGstRate(rate: Stripe.TaxRate) {
  return rate.active
    && rate.inclusive
    && rate.percentage === 15
    && rate.country === "NZ";
}

export async function getNzGstTaxRateId(stripe: Stripe, config: ReturnType<typeof getStripeConfig>) {
  if (config.gstRateId) return config.gstRateId;
  if (config.managedLive) throw new Error("The live NZ GST rate is not configured.");
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
