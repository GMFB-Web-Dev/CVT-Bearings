import "server-only";
import { SITE_KEY, productCanCheckout, type Product } from "@/lib/catalog";

export const PRODUCT_CACHE_TAG = `tenant:${SITE_KEY}:products`;
export const TENANT_CACHE_TAG = `tenant:${SITE_KEY}`;
const PRODUCT_COLUMNS = "site_key,id,slug,sku,title,description,product_kind,bearing_type,manufacturer,manufacturer_part_number,vehicle_brands,transmission_text,price_nzd,commerce_mode,dimensions,images,visible,track_inventory,stock_quantity,stock_status,catalogue_data,updated_at";
type JsonRecord = Record<string, unknown>;
type ProductRow = JsonRecord & { id: string; slug: string; site_key: string; visible: boolean; title: string };

function record(value: unknown): JsonRecord { return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {}; }
function strings(value: unknown) { return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []; }
function nullableNumber(value: unknown) { if (value == null || value === "") return null; const number = Number(value); return Number.isFinite(number) ? number : null; }
function text(value: unknown, fallback: string | null = null) { return typeof value === "string" && value.trim() ? value : fallback; }

function mapProduct(row: ProductRow): Product {
  const legacy = record(row.catalogue_data);
  const dimensions = { ...record(legacy.dimensions), ...record(row.dimensions) };
  const legacyApplications = record(legacy.applications);
  const legacyCommerce = record(legacy.commerce);
  const rowImages = Array.isArray(row.images) ? row.images : (Array.isArray(legacy.images) ? legacy.images : []);
  const search = record(legacy.search);
  const publication = record(legacy.publication);
  const shipping = record(legacy.shipping);
  const commerceMode = row.commerce_mode === "fixed_price" ? "fixed_price" : "quote";
  const product: Product = {
    id: String(row.id), sku: text(row.sku), slug: String(row.slug), title: text(row.title, "CVT bearing")!,
    updated_at: text(row.updated_at),
    description: text(row.description, text(legacy.description, `${row.title}. Contact our team to confirm application and fitment before ordering.`))!,
    product_kind: text(row.product_kind, text(legacy.product_kind, "bearing"))!, bearing_type: text(row.bearing_type, text(legacy.bearing_type)),
    manufacturer: text(row.manufacturer, text(legacy.manufacturer)), manufacturer_part_number: text(row.manufacturer_part_number, text(legacy.manufacturer_part_number)),
    dimensions: {
      inner_diameter_mm: nullableNumber(dimensions.inner_diameter_mm), outer_diameter_mm: nullableNumber(dimensions.outer_diameter_mm),
      width_mm: nullableNumber(dimensions.width_mm), recess_width_mm: nullableNumber(dimensions.recess_width_mm),
      width_values_mm: Array.isArray(dimensions.width_values_mm) ? dimensions.width_values_mm.map(Number).filter(Number.isFinite) : [],
      width_raw: typeof dimensions.width_raw === "string" || typeof dimensions.width_raw === "number" ? dimensions.width_raw : null,
    },
    applications: { transmission_text: text(row.transmission_text, text(legacyApplications.transmission_text)), vehicle_brands: strings(row.vehicle_brands).length ? strings(row.vehicle_brands) : strings(legacyApplications.vehicle_brands), verified_fitment: legacyApplications.verified_fitment === true },
    price: { amount: nullableNumber(row.price_nzd), currency: "NZD", tax_basis: "inclusive" },
    commerce: { mode: commerceMode, cart_eligible: commerceMode === "fixed_price", primary_cta: text(legacyCommerce.primary_cta, commerceMode === "fixed_price" ? "Add to cart" : "Get a quote")!, quote_enabled: commerceMode !== "fixed_price" || legacyCommerce.quote_enabled === true, quote_reason: text(legacyCommerce.quote_reason) },
    images: rowImages.flatMap((image) => { if (typeof image === "string") return [{ path: image, alt: row.title }]; const value = record(image); const path = text(value.path, text(value.url)); return path ? [{ path, alt: text(value.alt, row.title)! }] : []; }),
    search: { part_numbers: strings(search.part_numbers), normalised_part_numbers: strings(search.normalised_part_numbers) },
    publication: { visible: row.visible === true, source_visible: typeof publication.source_visible === "boolean" ? publication.source_visible : null, technical_data_complete: publication.technical_data_complete === true },
    shipping: { weight_kg: nullableNumber(shipping.weight_kg) },
    inventory: { track_inventory: row.track_inventory === true, stock_quantity: nullableNumber(row.stock_quantity), stock_status: text(row.stock_status, "in_stock")! },
  };
  product.commerce.cart_eligible = productCanCheckout(product);
  return product;
}

function productsURL() {
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!origin) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  const url = new URL("/rest/v1/products", origin);
  url.searchParams.set("select", PRODUCT_COLUMNS); url.searchParams.set("site_key", `eq.${SITE_KEY}`); url.searchParams.set("visible", "eq.true"); url.searchParams.set("order", "title.asc");
  return url;
}

async function fetchProducts(uncached: boolean) {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");
  const response = await fetch(productsURL(), { headers: { apikey: key, Accept: "application/json" }, ...(uncached ? { cache: "no-store" as const } : { next: { revalidate: 60, tags: [TENANT_CACHE_TAG, PRODUCT_CACHE_TAG] } }) });
  if (!response.ok) throw new Error(`Supabase product read failed (${response.status}).`);
  return ((await response.json()) as ProductRow[]).map(mapProduct);
}

export function getProducts() { return fetchProducts(false); }
export function getProductsUncached() { return fetchProducts(true); }
export async function getProduct(slug: string) { return (await getProducts()).find((product) => product.slug === slug); }
