import Link from "next/link";
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
  const dimensions = [
    product.dimensions.inner_diameter_mm != null ? `ID ${product.dimensions.inner_diameter_mm} mm` : null,
    product.dimensions.outer_diameter_mm != null ? `OD ${product.dimensions.outer_diameter_mm} mm` : null,
    product.dimensions.width_mm != null ? `Width ${product.dimensions.width_mm} mm` : null,
  ].filter(Boolean);
  const applications = [product.applications.transmission_text, ...product.applications.vehicle_brands].filter(Boolean);

  return (
    <div className="product-detail">
      <div className="page-width">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Bearings", href: "/bearings" },
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
            <p className="price-note">NZD · Shipping calculated at checkout</p>
            <div className="spec-list">
              <span><b>Item no.</b> {product.sku || product.id}</span>
              <span><b>Manufacturer part:</b> {product.manufacturer_part_number || "On request"}</span>
              <span><b>Condition:</b> New</span>
              <span><b>Minimum purchase:</b> 1 unit</span>
            </div>
            <ProductPurchase product={product}/>
            <div className="product-service-notes">
              <p><strong>Need help confirming fitment?</strong> Match the part number, transmission code and dimensions before ordering.</p>
              <Link href={`/contact?product=${product.id}`}>Ask our CVT team to confirm this bearing →</Link>
            </div>
          </div>
        </div>
        <nav className="product-detail-tabs" aria-label="Product page sections">
          <a href="#product-information">Product info</a>
          <a href="#product-specifications">Specifications</a>
          <a href="#product-fitment">Fitment</a>
          <a href="#product-reviews">Reviews</a>
        </nav>
        <section className="product-information" aria-label="Product information">
          <article id="product-information"><h2>Product info</h2><p>{product.description}</p></article>
          <article id="product-specifications"><h2>Specifications</h2><dl>
            <div><dt>Dimensions</dt><dd>{dimensions.length ? dimensions.join(" · ") : "Contact us for measurements"}</dd></div>
            <div><dt>Manufacturer</dt><dd>{product.manufacturer || "Not specified"}</dd></div>
            <div><dt>Bearing type</dt><dd>{bearingType || "CVT bearing"}</dd></div>
            {product.shipping.weight_kg != null && <div><dt>Weight</dt><dd>{product.shipping.weight_kg} kg</dd></div>}
          </dl></article>
          <article id="product-fitment"><h2>Vehicle & transmission fitment</h2><p>{applications.length ? applications.join(" · ") : "Fitment is not listed for this product. Please send us your transmission code or the markings on the original bearing and we will help confirm it."}</p><Link href={`/contact?product=${product.id}`}>Confirm compatibility →</Link></article>
        </section>
        <div id="product-reviews"><Reviews productId={product.id}/></div>
      </div>
      <PopularTypesSection excludeProductId={product.id} activeSection={productSection(product)}/>
      <PromoCards/>
    </div>
  );
}
