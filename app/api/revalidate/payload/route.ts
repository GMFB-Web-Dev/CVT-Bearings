import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_POSTS_TAG } from "@/lib/blog-posts";
import { PAGES_TAG, PAYLOAD_TENANT_SLUG, SHARED_TAG, TENANT_TAG } from "@/lib/cms";
import { PRODUCT_CACHE_TAG } from "@/lib/catalog-data";

const collections = new Set(["pages", "navigation", "tenant-site-settings", "media", "products", "product-media", "blog-posts"]);
const operations = new Set(["create", "update", "delete"]);
type WebhookBody = { tenantSlug?: unknown; collection?: unknown; operation?: unknown; pageSlug?: unknown; pagePath?: unknown; publicationStatus?: unknown };

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function validPagePath(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 1024
    && value.startsWith("/")
    && !value.startsWith("//")
    && !value.includes("//")
    && !/[\[\]]/.test(value)
    && !/[\u0000-\u001f\u007f]/.test(value);
}

function validSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,127}$/.test(value);
}

export async function POST(request: Request) {
  const expected = process.env.PAYLOAD_REVALIDATION_SECRET || process.env.REVALIDATION_SECRET;
  const supplied = request.headers.get("x-revalidation-secret");
  if (!expected || !supplied || !safeEqual(supplied, expected)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: WebhookBody;
  try { body = await request.json() as WebhookBody; }
  catch { return Response.json({ error: "Invalid JSON body" }, { status: 400 }); }

  if (body.tenantSlug !== PAYLOAD_TENANT_SLUG) return Response.json({ error: "Unsupported tenant" }, { status: 400 });
  if (typeof body.collection !== "string" || !collections.has(body.collection)) return Response.json({ error: "Unsupported collection" }, { status: 400 });
  if (typeof body.operation !== "string" || !operations.has(body.operation)) return Response.json({ error: "Unsupported operation" }, { status: 400 });
  if (body.pageSlug !== null && body.pageSlug !== undefined && !validSlug(body.pageSlug)) return Response.json({ error: "Invalid page slug" }, { status: 400 });
  if (body.pagePath !== null && body.pagePath !== undefined && !validPagePath(body.pagePath)) return Response.json({ error: "Invalid page path" }, { status: 400 });
  if (![null, undefined, "published", "draft"].includes(body.publicationStatus as null | undefined | string)) return Response.json({ error: "Invalid publication status" }, { status: 400 });

  revalidateTag(TENANT_TAG, { expire: 0 });
  if (body.collection === "blog-posts") {
    revalidateTag(BLOG_POSTS_TAG, { expire: 0 });
    revalidatePath("/blogs");
    revalidatePath("/blogs/[slug]", "page");
  } else if (body.collection === "pages") {
    revalidateTag(PAGES_TAG, { expire: 0 });
    if (validSlug(body.pageSlug)) revalidateTag(`${TENANT_TAG}:page:${body.pageSlug}`, { expire: 0 });
    if (validPagePath(body.pagePath)) revalidatePath(body.pagePath);
    if (body.operation === "delete") revalidatePath("/", "layout");
  } else if (["navigation", "tenant-site-settings", "media"].includes(body.collection)) {
    revalidateTag(SHARED_TAG, { expire: 0 });
    if (body.collection === "media") {
      revalidateTag(BLOG_POSTS_TAG, { expire: 0 });
      revalidatePath("/blogs");
      revalidatePath("/blogs/[slug]", "page");
    }
    revalidatePath("/", "layout");
  } else {
    revalidateTag(PRODUCT_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
  }

  return Response.json({ revalidated: true, collection: body.collection, operation: body.operation });
}
