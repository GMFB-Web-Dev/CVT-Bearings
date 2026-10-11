import { money, productImage, products, type Product } from "@/lib/catalog";
import {
  normaliseSearch,
  parseDimension,
  parseLooseDimensionQuery,
  productDimensionLabel,
  productMatchesDimensions,
  productMatchesLooseDimensions,
  productMatchesType,
  productSearchScore,
} from "@/lib/product-search";
import { createClient } from "@/lib/supabase/server";

type SearchRow = { id: string; relevance: number | null };

function matchesVehicle(product: Product, vehicle: string) {
  const needle = normaliseSearch(vehicle);
  return !needle || product.applications.vehicle_brands.some((brand) => normaliseSearch(brand) === needle);
}

function detailsFor(product: Product, vehicle: string, type: string) {
  const details: string[] = [];
  if (vehicle && matchesVehicle(product, vehicle)) details.push(`${vehicle} fitment`);
  if (type && productMatchesType(product, type)) details.push(type.replaceAll("_", " "));
  if (!vehicle && product.manufacturer) details.push(product.manufacturer);
  const dimensions = productDimensionLabel(product);
  if (dimensions) details.push(dimensions);
  return details.slice(0, 2);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const inferredDimensions = parseLooseDimensionQuery(query);
  const vehicle = params.get("brand")?.trim() ?? "";
  const type = params.get("type")?.trim() ?? "";
  const dimensions = {
    inner: parseDimension(params.get("inner")),
    outer: parseDimension(params.get("outer")),
    width: parseDimension(params.get("width")),
    tolerance: parseDimension(params.get("tolerance")) ?? 1,
  };
  const requestedLimit = Number(params.get("limit") ?? 3);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.round(requestedLimit), 1), 8) : 3;
  const hasDimensions = dimensions.inner != null || dimensions.outer != null || dimensions.width != null;

  if (!query && !vehicle && !type && !hasDimensions) return Response.json({ results: [] });

  const byId = new Map(products.map((product) => [product.id, product]));
  let ranked: Array<{ product: Product; score: number }> | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("search_cvt_products", {
        search_query: inferredDimensions.text || null,
        vehicle_brand: vehicle || null,
        product_bearing_type: type || null,
        inner_diameter: dimensions.inner,
        outer_diameter: dimensions.outer,
        bearing_width: dimensions.width,
        dimension_values: inferredDimensions.values.length ? inferredDimensions.values : null,
        dimension_tolerance: dimensions.tolerance,
        result_limit: limit,
      });
      if (!error && Array.isArray(data)) {
        ranked = (data as SearchRow[]).flatMap((row) => {
          const product = byId.get(row.id);
          return product ? [{ product, score: Number(row.relevance ?? 0) }] : [];
        });
      }
    } catch {
      ranked = null;
    }
  }

  const localRanked = products.flatMap((product) => {
    const relevance = query ? productSearchScore(product, query) : 0;
    if (relevance == null || !matchesVehicle(product, vehicle) || !productMatchesType(product, type) || !productMatchesDimensions(product, dimensions) || !productMatchesLooseDimensions(product, inferredDimensions.values)) return [];
    return [{ product, score: relevance + (productImage(product) ? 25 : 0) }];
  });

  if (ranked) {
    const combined = new Map<string, { product: Product; score: number }>();
    ranked.forEach(({ product, score }) => combined.set(product.id, { product, score: score * 10 + (productImage(product) ? 25 : 0) }));
    localRanked.forEach((candidate) => {
      const existing = combined.get(candidate.product.id);
      if (!existing || candidate.score > existing.score) combined.set(candidate.product.id, candidate);
    });
    ranked = [...combined.values()];
  } else {
    ranked = localRanked;
  }

  ranked.sort((left, right) => right.score - left.score || left.product.title.localeCompare(right.product.title));
  ranked = ranked.slice(0, limit);

  return Response.json({
    results: ranked.map(({ product }) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: productImage(product),
      price: money(product.price.amount),
      details: detailsFor(product, vehicle, type),
    })),
  });
}
