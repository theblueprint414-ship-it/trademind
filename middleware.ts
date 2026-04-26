import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse, type NextRequest } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/",
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
];
const GATE_PATHS = ["/dashboard", "/partners", "/settings"];

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // Block oversized requests on API routes (max 1MB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > 1_000_000 && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!req.auth?.user?.id) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
    return NextResponse.next();
  }

  // First time user → redirect to onboarding
  const onboarded = (req as NextRequest).cookies.get("tm_onboarded");
  if (!onboarded && GATE_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
