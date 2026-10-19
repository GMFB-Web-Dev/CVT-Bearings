# CVT Bearings NZ

Figma-led ecommerce catalogue for CVT Bearings. The app includes the public storefront, sectioned bearing catalogue, product detail and review pages, content pages, contact enquiries, account authentication, persistent carts, and order-history scaffolding.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app expects these local variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX # public Google Tag Manager web-container ID
NEXT_PUBLIC_PAYLOAD_URL=https://payload.gmfb.co.nz
PAYLOAD_TENANT_SLUG=cvt-bearings
PAYLOAD_REVALIDATION_SECRET=... # server-only; Payload webhook credential
REVALIDATION_SECRET=... # server-only; scoped order-RPC credential
```

Product-review photos and videos are uploaded directly to a private Cloudflare
R2 bucket with short-lived, signed `PUT` URLs. Copy the full variable list from
`.env.example`, create the bucket named by `R2_BUCKET_NAME`, and set its CORS
policy to allow `PUT` requests from the storefront origin with the
`Content-Type` header. `R2_PUBLIC_BASE_URL` should point to the public/custom
domain used to serve approved review media.

## Content, catalogue, and database

- Published page copy, navigation, shared component copy, blog posts, and site media come from Payload at `payload.gmfb.co.nz`, tenant ID `6`. Source strings and local assets remain fallbacks for missing CMS fields.
- The live product catalogue comes from `public.products` in the CVT Supabase project, always scoped with `site_key = 'cvt-bearings'` and `visible = true`. The checked-in JSON catalogue is no longer used at runtime.
- Product and site media may be served from `media.gmfb.co.nz`; legacy files under `public/products/` and `public/assets/` remain supported during migration.
- Screenshot attachments are not application assets and must not be copied into or referenced by the site.
- The Supabase schema is in `supabase/migrations/`.
- All shared-project data is explicitly scoped with `site_key = 'cvt-bearings'` so future GMFB storefronts remain isolated.
- Row Level Security protects profiles, carts, orders, reviews, and enquiries. Quote-only products are rejected by the cart policy.

Public CMS and catalogue reads use tenant-scoped Next.js cache tags. Payload posts authenticated changes to `/api/revalidate/payload`; the route invalidates tenant, page/shared/blog/product tags and the affected paths. Never expose `PAYLOAD_REVALIDATION_SECRET` or `REVALIDATION_SECRET` to the browser or commit them.

## Verification

```bash
npm run lint
npm run build
```

## Google Tag Manager

Set `NEXT_PUBLIC_GTM_ID` to the Web container ID issued by Google Tag Manager,
for example `GTM-XXXXXXX`, then redeploy the Vercel Production environment. A
missing or malformed ID disables GTM. The root layout loads the container on
every route and includes Google's `<noscript>` fallback.

The initial document load is available to GTM's standard All Pages trigger.
Later Next.js navigations push a `virtual_page_view` event to `dataLayer` with
`page_path`, `page_location`, and `page_title`. In GTM, use a Custom Event
trigger named `virtual_page_view` for SPA page-view tags; do not also add a
History Change page-view trigger, because that would double count navigation.

## Search indexing

Next.js generates `/sitemap.xml` from published Payload pages and blog posts,
plus the visible live Supabase catalogue. Product and blog entries include their
current update timestamp and primary image where available. `/robots.txt` points
crawlers to the sitemap and excludes account, authentication, cart, checkout,
and API routes.

## Stripe Checkout

Stripe-hosted Checkout is implemented for signed-in customers purchasing fixed-price products. Catalogue prices are treated as GST-inclusive: Checkout itemises the included 15% NZ GST without adding it again. The signed webhook stores Stripe's final `amount_total` as the authoritative order total, and the purchased cart is cleared only after the returning Checkout Session is confirmed as paid for the signed-in customer.

Stripe account, webhook, Vercel environment-variable and sandbox testing steps are documented in [`docs/stripe-checkout.md`](docs/stripe-checkout.md). Keep test and live credentials separate, and complete the documented sandbox checkout before enabling live payments.
