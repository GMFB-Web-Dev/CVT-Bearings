import type { Product } from "@/lib/catalog";

export function normaliseSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function compactSearch(value: string) {
  return normaliseSearch(value).replaceAll(" ", "");
}

export type DimensionFilters = {
  inner?: number | null;
  outer?: number | null;
  width?: number | null;
  tolerance?: number;
};

export function parseDimension(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseLooseDimensionQuery(value: string) {
  const match = value.match(/(\d{1,3}(?:[.,]\d+)?)\s*[x×]\s*(\d{1,3}(?:[.,]\d+)?)(?:\s*[x×]\s*(\d{1,3}(?:[.,]\d+)?))?/i);
  if (!match) return { values: [] as number[], text: value };
  const values = match.slice(1, 4).filter(Boolean).map((item) => Number(item.replace(",", "."))).filter(Number.isFinite);
  return { values, text: `${value.slice(0, match.index)} ${value.slice((match.index ?? 0) + match[0].length)}`.trim() };
}

export function productMatchesLooseDimensions(product: Product, values: number[], tolerance = 1) {
  if (!values.length) return true;
  const actual = [product.dimensions.inner_diameter_mm, product.dimensions.outer_diameter_mm, product.dimensions.width_mm].filter((item): item is number => item != null);
  return values.every((requested) => actual.some((dimension) => Math.abs(dimension - requested) <= tolerance));
}

export function productMatchesDimensions(product: Product, filters: DimensionFilters) {
  const tolerance = Math.max(0, filters.tolerance ?? 1);
  const dimensions = [
    [filters.inner, product.dimensions.inner_diameter_mm],
    [filters.outer, product.dimensions.outer_diameter_mm],
    [filters.width, product.dimensions.width_mm],
  ] as const;

  return dimensions.every(([requested, actual]) => requested == null || (actual != null && Math.abs(actual - requested) <= tolerance));
}

export function productMatchesType(product: Product, type: string) {
  const needle = normaliseSearch(type);
  if (!needle) return true;
  const haystack = normaliseSearch([
    product.bearing_type?.replaceAll("_", " "),
    product.product_kind,
    product.title,
  ].filter(Boolean).join(" "));
  return haystack.includes(needle);
}

export function productDimensionLabel(product: Product) {
  const { inner_diameter_mm: inner, outer_diameter_mm: outer, width_mm: width } = product.dimensions;
  if (inner == null && outer == null && width == null) return null;
  return `${inner ?? "—"} × ${outer ?? "—"} × ${width ?? "—"} mm`;
}

function distance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function closestWordDistance(term: string, words: string[]) {
  if (term.length < 3) return Number.POSITIVE_INFINITY;
  const tolerance = term.length >= 10 ? 3 : term.length >= 5 ? 2 : 1;
  const closest = words.reduce((best, word) => {
    if (Math.abs(word.length - term.length) > tolerance) return best;
    return Math.min(best, distance(term, word));
  }, Number.POSITIVE_INFINITY);
  return closest <= tolerance ? closest : Number.POSITIVE_INFINITY;
}

export function productSearchScore(product: Product, query: string) {
  const parsedDimensions = parseLooseDimensionQuery(query);
  if (!productMatchesLooseDimensions(product, parsedDimensions.values)) return null;
  const needle = normaliseSearch(parsedDimensions.text);
  if (!needle) return parsedDimensions.values.length ? 70 : 0;

  const partNumbers = [product.sku, product.manufacturer_part_number, ...product.search.part_numbers].filter(Boolean) as string[];
  const searchable = [
    product.title,
    product.manufacturer,
    product.bearing_type,
    product.applications.transmission_text,
    ...product.applications.vehicle_brands,
    ...partNumbers,
  ].filter(Boolean).join(" ");
  const haystack = normaliseSearch(searchable);
  const compactNeedle = compactSearch(parsedDimensions.text);
  const compactHaystack = compactSearch(searchable);
  const words = [...new Set(haystack.split(" ").filter(Boolean))];
  const terms = needle.split(" ").filter(Boolean);
  let fuzzyPenalty = 0;

  const matches = terms.every((term) => {
    if (haystack.includes(term) || compactHaystack.includes(compactSearch(term))) return true;
    const wordDistance = closestWordDistance(term, words);
    if (Number.isFinite(wordDistance)) {
      fuzzyPenalty += wordDistance;
      return true;
    }
    return false;
  });
  if (!matches) return null;

  const compactParts = partNumbers.map(compactSearch);
  const title = normaliseSearch(product.title);
  const compactTitle = compactSearch(product.title);
  const titleWords = title.split(" ").filter(Boolean);
  const titleTermsMatch = terms.every((term) => title.includes(term) || Number.isFinite(closestWordDistance(term, titleWords)));
  const firstTermMatchesTitleStart = Boolean(terms[0] && titleWords[0]) && (
    titleWords[0].includes(terms[0]) || Number.isFinite(closestWordDistance(terms[0], [titleWords[0]]))
  );
  let score = 35;
  if (compactParts.includes(compactNeedle)) score = 150;
  else if (compactParts.some((part) => part.startsWith(compactNeedle))) score = 125;
  else if (compactTitle === compactNeedle) score = 115;
  else if (title.startsWith(needle)) score = 95;
  else if (compactTitle.includes(compactNeedle)) score = 80;
  else if (titleTermsMatch && firstTermMatchesTitleStart) score = 75;
  else if (titleTermsMatch) score = 58;
  else if (compactHaystack.includes(compactNeedle)) score = 65;

  return score - fuzzyPenalty * 8;
}
