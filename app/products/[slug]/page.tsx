import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { money, productImage, productSection } from "@/lib/catalog";
import { getProduct, getProducts } from "@/lib/catalog-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PopularTypesSection } from "@/components/PopularTypesSection";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductRating } from "@/components/ProductRating";
import { PromoCards } from "@/components/SharedSections";
import { Reviews } from "@/components/Reviews";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailTabs } from "@/components/ProductDetailTabs";
import { entry, getSiteSettings, section as cmsSection } from "@/lib/cms";

export const instant = false;

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return {
    title: product?.title || "Product",
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const [product, settings, allProducts] = await Promise.all([getProduct(slug), getSiteSettings(), getProducts()]);
  if (!product) notFound();
  const content = cmsSection(settings, "app/products/[slug]/page.tsx");
  const c = (key: string, fallback: string) => entry(content, key, fallback);

  const galleryImages = product.images.flatMap((image, index) => {
    const src = productImage(product, index);
    return src ? [{ src, alt: image.alt || product.title }] : [];
  });
  const bearingType = product.bearing_type?.replaceAll("_", " ");
  const applications = [product.applications.transmission_text, ...product.applications.vehicle_brands]
    .filter((value): value is string => Boolean(value));
  const section = productSection(product);
  const sectionLabel = bearingType
    ? `${bearingType.replace(/\b\w/g, (letter) => letter.toUpperCase())}`
    : c("copy-001", "CVT Bearings");

  return (
    <div className="product-detail">
      <div className="page-width">
        <Breadcrumbs
          items={[
            { label: c("copy-002", "Home"), href: "/" },
            { label: c("copy-003", "All Products"), href: "/bearings" },
            { label: sectionLabel, href: `/bearings/${section}` },
            { label: product.title },
          ]}
        />
        <div className="product-main">
          <ProductGallery images={galleryImages} productTitle={product.title}/>
          <div className="product-info">
            <p className="product-eyebrow">{[product.manufacturer, bearingType].filter(Boolean).join(" · ") || c("copy-004", "CVT bearing")}</p>
            <h1>{product.title}</h1>
            <ProductRating productId={product.id}/>
            <div className="price">{money(product.price.amount)}</div>
            <div className="spec-list">
              <span><b>{c("copy-005", "SKU:")}</b> {product.sku || product.id}</span>
              <span><b>{c("copy-006", "Condition:")}</b> {c("copy-007", "New")}</span>
              {product.shipping.weight_kg != null && <span><b>{c("copy-008", "Weight:")}</b> {product.shipping.weight_kg} {c("copy-009", "kg")}</span>}
              <span><b>{c("copy-010", "Minimum purchase:")}</b> {c("copy-011", "1 unit")}</span>
              <span><b>{c("copy-012", "Shipping:")}</b> {c("copy-013", "Calculated at checkout")}</span>
            </div>
            <ProductPurchase product={product}/>
            <ProductDetailTabs description={product.description} fitment={applications} contactHref={`/contact?product=${product.id}`}/>
          </div>
        </div>
        <div id="product-reviews"><Reviews productId={product.id}/></div>
      </div>
      <PopularTypesSection products={allProducts} excludeProductId={product.id} activeSection={section}/>
      <PromoCards/>
    </div>
  );
}
