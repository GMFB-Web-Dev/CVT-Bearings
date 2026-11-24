import { createClient } from "@/lib/supabase/server";
import { grantPasswordRecovery } from "@/lib/supabase/password-recovery";

type LinkType = "email" | "recovery";
type VerificationLink =
  | { tokenHash: string; type: LinkType; code: null; flowId: null }
  | { tokenHash: null; type: LinkType | null; code: string; flowId: string | null };

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function linkToken(value: FormDataEntryValue | string | null) {
  return typeof value === "string" && /^[A-Za-z0-9._-]{1,1024}$/.test(value) ? value : null;
}

function readLink(fields: URLSearchParams | FormData): VerificationLink | null {
  const type = fields.get("type");
  if (type !== null && type !== "email" && type !== "recovery") return null;

  const tokenHash = linkToken(fields.get("token_hash"));
  const code = linkToken(fields.get("code"));
  const flowId = linkToken(fields.get("sb_flow_id"));

  if (tokenHash && type && !code) return { tokenHash, type, code: null, flowId: null };
  if (code && !tokenHash) return { tokenHash: null, type, code, flowId };
  return null;
}

function redirectTo(path: string) {
  return new Response(null, {
    status: 303,
    headers: { ...privateHeaders, Location: path, "Referrer-Policy": "no-referrer" },
  });
}

function invalidLink(type: LinkType | null) {
  return redirectTo(`/login-sign-up?mode=${type === "recovery" ? "forgot" : "resend"}&auth=invalid-link`);
}

export function GET(request: Request) {
  const fields = new URL(request.url).searchParams;
  const link = readLink(fields);
  if (!link) return invalidLink(fields.get("type") === "recovery" ? "recovery" : null);

  const title = link.type === "email" ? "Confirm your email" : link.type === "recovery"
    ? "Reset your password" : "Continue to your account";
  const hiddenFields = [
    ["token_hash", link.tokenHash],
    ["type", link.type],
    ["code", link.code],
    ["sb_flow_id", link.flowId],
  ].filter(([, value]) => value)
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${value}">`)
    .join("");

  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | CVT Bearings</title>
  <style>
    body { background:#f7f7f7; color:#101828; display:grid; place-items:center; min-height:100vh; margin:0; font:1rem/1.5 system-ui,sans-serif }
    main { width:min(28rem,calc(100% - 2rem)); box-sizing:border-box; background:white; border:1px solid #ddd; border-radius:12px; padding:clamp(1.5rem,6vw,3rem) }
    h1 { font-size:clamp(1.75rem,6vw,2.25rem); line-height:1.2; margin:.4rem 0 1rem }
    p { margin:0 0 1.25rem }
    button { width:100%; padding:.75rem 1rem; border:0; border-radius:6px; background:#c12217; color:#fff; font:inherit; font-weight:600; cursor:pointer }
    button:hover { background:#111 }
    a { display:inline-block; margin-top:1rem; color:#a21b13 }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>Continue if you requested this email from CVT Bearings.</p>
    <form method="post" action="/auth/confirm">
      ${hiddenFields}
      <button type="submit">Continue</button>
    </form>
    <a href="/login-sign-up">Back to sign in</a>
  </main>
</body>
</html>`, {
    headers: {
      ...privateHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "strict-origin",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    },
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.slice(0, -1);
  if (request.headers.get("origin") !== `${protocol}://${host}`) {
    return new Response(null, { status: 403, headers: privateHeaders });
  }

  const fields = await request.formData().catch(() => null);
  const link = fields && readLink(fields);
  if (!link) return invalidLink(fields?.get("type") === "recovery" ? "recovery" : null);

  const supabase = await createClient();
  const { data, error } = link.tokenHash !== null
    ? await supabase.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type })
    : await supabase.auth.exchangeCodeForSession(link.code, link.flowId ? { flowId: link.flowId } : undefined);

  if (error || !data.session) return invalidLink(link.type);

  const recovery = link.tokenHash
    ? link.type === "recovery"
    : "redirectType" in data && data.redirectType === "recovery";

  if (recovery) {
    const { data: verified } = await supabase.auth.getClaims(data.session.access_token);
    if (!await grantPasswordRecovery(verified?.claims.session_id)) {
      await supabase.auth.signOut({ scope: "local" });
      return invalidLink("recovery");
    }
    return redirectTo("/auth/reset-password");
  }

  return redirectTo("/account");
}
