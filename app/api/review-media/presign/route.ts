import { createClient } from "@/lib/supabase/server";
import { createReviewUpload, r2Configured } from "@/lib/r2";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);
const maximumFileSize = 10 * 1024 * 1024;

type UploadRequest = { productId?: string; files?: Array<{ name?: string; type?: string; size?: number }> };

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "upload";
}

export async function POST(request: Request) {
  if (!r2Configured()) return Response.json({ error: "Review media storage is not configured yet." }, { status: 503 });
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (!userId) return Response.json({ error: "Sign in before uploading review media." }, { status: 401 });

  const body = await request.json() as UploadRequest;
  const productId = body.productId?.trim();
  const files = body.files || [];
  if (!productId || productId.length > 120) return Response.json({ error: "A valid product is required." }, { status: 400 });
  if (!files.length || files.length > 5) return Response.json({ error: "Choose between 1 and 5 files." }, { status: 400 });
  if (files.some((file) => !file.name || !file.type || !allowedTypes.has(file.type) || !file.size || file.size > maximumFileSize)) return Response.json({ error: "Use JPG, PNG, WebP, MP4 or WebM files no larger than 10 MB each." }, { status: 400 });

  const uploads = await Promise.all(files.map(async (file) => {
    const key = `cvt-bearings/reviews/${safeName(productId)}/${userId}/${crypto.randomUUID()}-${safeName(file.name!)}`;
    const signed = await createReviewUpload({ key, type: file.type! });
    return { key, uploadUrl: signed.uploadUrl, url: signed.url, name: file.name!, type: file.type! };
  }));
  return Response.json({ uploads });
}
