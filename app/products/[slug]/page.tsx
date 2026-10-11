import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, money, productImage, products, productSection } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PopularTypesSection } from "@/components/PopularTypesSection";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductRating } from "@/components/ProductRating";
import { PromoCards } from "@/components/SharedSections";
import { Reviews } from "@/components/Reviews";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailTabs } from "@/components/ProductDetailTabs";

export const instant = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = getProduct((await params).slug);
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
  const product = getProduct((await params).slug);
  if (!product) notFound();

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
    : "CVT Bearings";

  return (
    <div className="product-detail">
      <div className="page-width">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "All Products", href: "/bearings" },
            { label: sectionLabel, href: `/bearings/${section}` },
            { label: product.title },
          ]}
        />
        <div className="product-main">
          <ProductGallery images={galleryImages} productTitle={product.title}/>
          <div className="product-info">
            <p className="product-eyebrow">{[product.manufacturer, bearingType].filter(Boolean).join(" · ") || "CVT bearing"}</p>
            <h1>{product.title}</h1>
            <ProductRating productId={product.id}/>
            <div className="price">{money(product.price.amount)}</div>
            <div className="spec-list">
              <span><b>SKU:</b> {product.sku || product.id}</span>
              <span><b>Condition:</b> New</span>
              {product.shipping.weight_kg != null && <span><b>Weight:</b> {product.shipping.weight_kg} kg</span>}
              <span><b>Minimum purchase:</b> 1 unit</span>
              <span><b>Shipping:</b> Calculated at checkout</span>
            </div>
            <ProductPurchase product={product}/>
            <ProductDetailTabs description={product.description} fitment={applications} contactHref={`/contact?product=${product.id}`}/>
          </div>
        </div>
        <div id="product-reviews"><Reviews productId={product.id}/></div>
      </div>
      <PopularTypesSection excludeProductId={product.id} activeSection={section}/>
      <PromoCards/>
    </div>
  );
}
