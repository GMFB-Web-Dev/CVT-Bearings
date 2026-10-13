export const SITE_KEY = "cvt-bearings" as const;

export interface Product {
  id: string;
  sku: string | null;
  slug: string;
  title: string;
  description: string;
  product_kind: string;
  bearing_type: string | null;
  manufacturer: string | null;
  manufacturer_part_number: string | null;
  dimensions: { inner_diameter_mm: number | null; outer_diameter_mm: number | null; width_mm: number | null; recess_width_mm: number | null; width_values_mm: number[]; width_raw: string | number | null };
  applications: { transmission_text: string | null; vehicle_brands: string[]; verified_fitment: boolean };
  price: { amount: number | null; currency: string; tax_basis: string };
  commerce: { mode: "fixed_price" | "quote"; cart_eligible: boolean; primary_cta: string; quote_enabled: boolean; quote_reason: string | null };
  images: Array<{ path: string; alt: string }>;
  search: { part_numbers: string[]; normalised_part_numbers: string[] };
  publication: { visible: boolean; source_visible: boolean | null; technical_data_complete: boolean };
  shipping: { weight_kg: number | null };
  inventory: { track_inventory: boolean; stock_quantity: number | null; stock_status: string };
}

export function productImage(product: Product, index = 0) {
  const path = product.images[index]?.path?.trim();
  if (!path) return null;
  if (/^https:\/\//i.test(path)) return path;
  if (/^http:\/\//i.test(path)) return path.replace(/^http:\/\//i, "https://");
  if (path.startsWith("/")) return path;
  return `/${path.replace(/^photos\/products\//, "products/")}`;
}

export function money(amount: number | null | undefined) {
  if (amount == null) return "Price on request";
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(amount);
}

export type ProductSection = "main-bearing-kits" | "pulley-bearings" | "primary-pulley-bearings";

export function productSection(product: Product): ProductSection {
  const haystack = [product.title, product.product_kind, product.bearing_type, product.applications.transmission_text].filter(Boolean).join(" ").toLowerCase();
  if (/primary|support/.test(haystack)) return "primary-pulley-bearings";
  if (/pulley/.test(haystack)) return "pulley-bearings";
  return "main-bearing-kits";
}

export function sectionProducts(products: Product[], section?: string) {
  if (!section) return products;
  const needle = section.replaceAll("-", " ").toLowerCase();
  return products.filter((product) => {
    const haystack = [product.title, product.product_kind, product.bearing_type, product.applications.transmission_text, ...product.applications.vehicle_brands].filter(Boolean).join(" ").toLowerCase();
    if (section === "main-bearing-kits") return /kit|set/.test(haystack);
    if (section === "pulley-bearings") return /pulley/.test(haystack) && !/primary/.test(haystack);
    if (section === "primary-pulley-bearings") return /primary|support/.test(haystack);
    return haystack.includes(needle);
  });
}

export function productCanCheckout(product: Product) {
  const inventoryAvailable = !product.inventory.track_inventory || (product.inventory.stock_status === "in_stock" && (product.inventory.stock_quantity ?? 0) > 0);
  return product.publication.visible && product.commerce.mode === "fixed_price" && product.commerce.cart_eligible && product.price.amount != null && inventoryAvailable;
}
