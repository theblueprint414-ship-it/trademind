import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

// NOTE: "/" must NOT be matched with `startsWith` — every path starts with "/",
// which previously made this allowlist match unconditionally and disabled the
// entire auth gate for every route, for every user. It's checked as an exact
// match below instead.
const PUBLIC_PATHS = [
  "/login",
  "/login/verify",
  "/accept-invite",
  "/api/auth",
  "/api/stats",
  "/privacy",
  "/terms",
  "/refund",
  "/contact",
  "/pricing",
  "/blog",
  "/for-ftmo-traders",
  "/vs-tradezella",
  "/vs-tradersync",
  "/vs-edgewonk",
  "/about",
  "/security",
  "/changelog",
  "/integrations",
  "/partners-program",
  "/join-circle",
  "/unsubscribe",
  "/u/",
  "/help",
  "/testimonials",
  "/admin",
];

// First-time-user → /onboarding redirect is handled DB-side (see /api/me's
// `isNewUser` + app/dashboard/page.tsx), not here — the Edge runtime this proxy
// runs in has no Prisma/DB access, and the old approach (a client-only
// `tm_onboarded` cookie) never reflected real account state across devices or
// for accounts created before the cookie existed.
export const proxy = auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // Block oversized requests on API routes (max 1MB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > 1_000_000 && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  // Allow public paths and static assets
  if (
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!req.auth?.user?.id && pathname !== "/login") {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
