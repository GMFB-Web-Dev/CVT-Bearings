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
```

Product-review photos and videos are uploaded directly to a private Cloudflare
R2 bucket with short-lived, signed `PUT` URLs. Copy the full variable list from
`.env.example`, create the bucket named by `R2_BUCKET_NAME`, and set its CORS
policy to allow `PUT` requests from the storefront origin with the
`Content-Type` header. `R2_PUBLIC_BASE_URL` should point to the public/custom
domain used to serve approved review media.

## Data and database

- `data/products.json` is the deployment catalogue supplied by CVT Bearings.
- Product media under `public/products/` comes from the developer package; design media under `public/assets/` comes from the Figma export.
- Screenshot attachments are not application assets and must not be copied into or referenced by the site.
- The Supabase schema is in `supabase/migrations/`.
- All shared-project data is explicitly scoped with `site_key = 'cvt-bearings'` so future GMFB storefronts remain isolated.
- Row Level Security protects profiles, carts, orders, reviews, and enquiries. Quote-only products are rejected by the cart policy.

## Verification

```bash
npm run lint
npm run build
```

Stripe checkout is intentionally not connected yet. Cart totals and order data are ready for the payment integration phase, while checkout remains disabled.
