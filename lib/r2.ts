import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnvironment = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"] as const;

export function r2Configured() {
  return requiredEnvironment.every((name) => Boolean(process.env[name]));
}

export async function createReviewUpload(input: { key: string; type: string }) {
  if (!r2Configured()) throw new Error("Review media storage is not configured.");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: input.key, ContentType: input.type }), { expiresIn: 300 });
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return { uploadUrl, url: base ? `${base}/${input.key}` : null };
}
