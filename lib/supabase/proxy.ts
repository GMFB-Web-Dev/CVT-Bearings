import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/auth/confirm") return NextResponse.next({ request });

  if (request.method === "GET" && pathname === "/account"
      && (searchParams.has("code") || searchParams.has("token_hash") || searchParams.has("error_code"))) {
    const confirmationUrl = request.nextUrl.clone();
    confirmationUrl.pathname = "/auth/confirm";
    confirmationUrl.search = "";
    for (const name of ["code", "token_hash", "type", "sb_flow_id"]) {
      const value = searchParams.get(name);
      if (value) confirmationUrl.searchParams.set(name, value);
    }

    return NextResponse.redirect(confirmationUrl, {
      status: 303,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    },
  );
  const { data } = await supabase.auth.getClaims();

  if (pathname === "/account" && !data?.claims?.sub) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login-sign-up";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", "/account#wishlist");

    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));

    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(header);
      if (value) redirectResponse.headers.set(header, value);
    }

    return redirectResponse;
  }

  return response;
}
