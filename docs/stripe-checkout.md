# Stripe Checkout setup

The storefront uses Stripe-hosted Checkout. Product IDs and quantities come from the browser, but prices, eligibility and currency are always re-read from the server catalogue before a Checkout Session is created. All displayed fixed-price catalogue amounts are treated as GST-inclusive unless CVT Bearings supplies definitive product-level evidence otherwise.

## Stripe account setup

Use the CVT Bearings Stripe account, starting in test mode.

1. Create an active, inclusive 15% NZ GST tax rate and copy its `txr_...` ID. Applying this rate itemises the included GST without increasing the catalogue price.
2. Create the approved New Zealand delivery rate and copy its `shr_...` ID.
3. Set the business name, branding, support details, privacy-policy URL and terms URL in Stripe Checkout settings.
4. Leave payment methods managed in Stripe. The app deliberately does not pass `payment_method_types`, so Checkout can select eligible methods dynamically.
5. Create a restricted server key with the minimum access required to create/retrieve Checkout Sessions and read the configured tax/shipping rates.
6. Add a webhook endpoint at `https://cvt-bearings.vercel.app/api/stripe/webhook` for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`

## Vercel environment variables

Add these to Preview and Production, using test-mode values until the test checkout has been verified. Store the Stripe secret, webhook secret, and Supabase service-role key as Vercel **Secret** variables; the tax/shipping IDs and public site URL can be **Config** variables.

```text
STRIPE_SECRET_KEY=rk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_NZ_GST_TAX_RATE_ID=txr_...
STRIPE_NZ_SHIPPING_RATE_ID=shr_...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://cvt-bearings.vercel.app
```

The service-role key is server-only and is used only to create order records and process signed Stripe webhook events. Never prefix it with `NEXT_PUBLIC_`.

## Local webhook test

Use Stripe CLI forwarding and place its temporary signing secret in `.env.local`:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Then complete a test-mode Checkout Session. Confirm that the order moves from `pending` to `paid` in Supabase only after the signed webhook arrives.

Also confirm that:

- the saved `total_nzd` exactly matches the Checkout Session `amount_total`;
- `tax_nzd` is the included GST portion and is not added to `total_nzd` again;
- the purchased browser and Supabase carts are cleared/converted after the paid return;
- the configured delivery amount and its GST treatment match the approved CVT Bearings charge.

## Going live

Repeat the inclusive tax rate, shipping rate, restricted key and webhook setup in live mode. Do not mix test IDs with live credentials. Confirm the delivery charge with CVT Bearings before accepting live payments.
