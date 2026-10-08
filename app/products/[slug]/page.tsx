import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, money, productImage, products } from "@/lib/catalog";
import { ProductPurchase } from "@/components/ProductPurchase";
import { Reviews } from "@/components/Reviews";
import { PromoCards } from "@/components/SharedSections";
import { PopularTypesSection } from "@/components/PopularTypesSection";

export const instant = false;
export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const product = getProduct((await params).slug); return { title: product?.title || "Product", description: product?.description }; }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug); if (!product) notFound(); const image = productImage(product); const thumbnails = product.images.map((_, index) => productImage(product, index)).filter((value): value is string => Boolean(value)).slice(0, 4);
  return <div className="product-detail"><div className="page-width"><div className="breadcrumbs">Home / Bearings / {product.title}</div><div className="product-main"><div className="product-gallery"><div className="main-image">{image ? <Image src={image} fill sizes="(max-width: 800px) 100vw, 50vw" alt={product.images[0]?.alt || product.title} priority/> : <span className="product-image-placeholder">Image coming soon</span>}</div>{thumbnails.length > 0 && <div className="thumbs">{thumbnails.map((thumbnail, index) => <Image key={thumbnail} src={thumbnail} width={100} height={100} alt={product.images[index]?.alt || ""}/>)}</div>}</div><div className="product-info"><h1>{product.title}</h1><div className="stars">★★★★★</div><div className="price">{money(product.price.amount)}</div><div className="spec-list"><span>SKU: {product.sku || "On request"}</span><span>Condition: New</span><span>Weight: {product.shipping.weight_kg ? `${product.shipping.weight_kg} KGS` : "Contact us"}</span><span>Minimum Purchase: 1 unit</span><span>Shipping: Calculated at Checkout</span></div><ProductPurchase product={product}/><div className="description-tabs"><b>Product details</b><span>Payment options</span></div><p className="product-description">{product.description}</p>{product.dimensions.inner_diameter_mm != null && <p><b>Dimensions:</b> ID {product.dimensions.inner_diameter_mm} mm · OD {product.dimensions.outer_diameter_mm} mm · Width {product.dimensions.width_mm} mm</p>}<p><b>Application:</b> {product.applications.transmission_text || product.applications.vehicle_brands.join(", ") || "Please confirm your transmission code before ordering."}</p></div></div><Reviews productId={product.id}/></div><PopularTypesSection excludeProductId={product.id}/><PromoCards/><div style={{textAlign:"center",paddingBottom:30}}><Link href="/bearings">View full catalogue</Link></div></div>;
}
