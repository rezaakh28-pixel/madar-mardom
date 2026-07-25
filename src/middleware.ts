import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySession } from "@/lib/signed-cookie";

// ---------------------------------------------------------------------------
// Edge middleware:
//  1. Rate-limits sensitive POST routes (e.g. Voice of People submissions).
//  2. Gates /dashboard/* routes by role, verified from the signed session
//     cookie set at /login (see src/app/login/actions.ts).
//
// NOTE: middleware runs on the Edge runtime, so it cannot import Prisma or
// other Node-only modules — verifySession() uses the Web Crypto API, which
// works on both Edge and Node, for exactly this reason. Once NextAuth is
// wired in, replace the cookie check below with `auth()` from
// `next-auth/middleware`, or use its `withAuth` wrapper directly.
// ---------------------------------------------------------------------------

const DASHBOARD_ROLE_BY_PREFIX: Record<string, string[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/editor": ["EDITOR", "ADMIN"],
  "/dashboard/reporter": ["REPORTER", "EDITOR", "ADMIN"],
};

const RATE_LIMITED_ROUTES: Array<{ prefix: string; limit: number; windowMs: number }> = [
  { prefix: "/api/voice/submit", limit: 5, windowMs: 10 * 60 * 1000 }, // 5 submissions / 10 min / IP
  { prefix: "/login", limit: 15, windowMs: 5 * 60 * 1000 }, // brute-force guard on login attempts
  { prefix: "/register", limit: 5, windowMs: 10 * 60 * 1000 },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -- 1. Rate limiting for sensitive POST routes -------------------------
  if (request.method === "POST") {
    const rule = RATE_LIMITED_ROUTES.find((r) => pathname.startsWith(r.prefix));
    if (rule) {
      const ip = getClientIp(request);
      const result = checkRateLimit({ key: `${rule.prefix}:${ip}`, limit: rule.limit, windowMs: rule.windowMs });
      if (!result.allowed) {
        return NextResponse.json(
          { error: "درخواست‌های شما بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." },
          { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } }
        );
      }
    }
  }

  // -- 2. Dashboard RBAC gate ----------------------------------------------
  const dashboardRule = Object.entries(DASHBOARD_ROLE_BY_PREFIX).find(([prefix]) =>
    pathname.startsWith(prefix)
  );
  if (dashboardRule) {
    const [, allowedRoles] = dashboardRule;
    const token = request.cookies.get("mm_session")?.value;
    const payload = await verifySession(token);

    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (!allowedRoles.includes(payload.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/reporter";
      url.searchParams.set("denied", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/voice/:path*", "/login", "/register"],
};
