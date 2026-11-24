import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "cvt-password-recovery";
const lifetimeSeconds = 15 * 60;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/auth/reset-password",
} as const;

function signGrant(sessionId: string, expiresAt: string) {
  const secret = process.env.AUTH_RECOVERY_COOKIE_SECRET || process.env.REVALIDATION_SECRET;
  if (!secret) return null;

  return createHmac("sha256", secret)
    .update(`cvt-bearings-password-recovery-v1\n${sessionId}\n${expiresAt}`)
    .digest("base64url");
}

export async function grantPasswordRecovery(sessionId: unknown) {
  if (typeof sessionId !== "string" || !sessionId) return false;

  const expiresAt = String(Math.floor(Date.now() / 1000) + lifetimeSeconds);
  const signature = signGrant(sessionId, expiresAt);
  if (!signature) return false;

  const store = await cookies();
  store.set(cookieName, `${expiresAt}.${signature}`, { ...cookieOptions, maxAge: lifetimeSeconds });
  return true;
}

export async function hasPasswordRecovery(sessionId: unknown) {
  if (typeof sessionId !== "string" || !sessionId) return false;

  const store = await cookies();
  const value = store.get(cookieName)?.value;
  const match = value?.match(/^(\d+)\.([A-Za-z0-9_-]{43})$/);
  if (!match) return false;

  const [, expiresAt, signature] = match;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expected = signGrant(sessionId, expiresAt);
  return expected !== null && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function clearPasswordRecovery() {
  const store = await cookies();
  store.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}
