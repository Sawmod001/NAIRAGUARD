import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";

/**
 * Auth guard + Rate limiting — NG-101 + Hardening Spec #1-2
 * Server-enforced (docs/10_SECURITY). Protects /(app)/*, leaves public routes open.
 * Fix bfcache: authenticated routes get no-store so Back after sign-out cannot restore.
 * Rate limiting: 429 + Retry-After per spec §2.
 */

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/onboarding",
  "/api/auth",
];

function isPublic(pathname: string): boolean {
  return publicRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const NO_STORE = {
  "Cache-Control": "no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return;

  // Rate limiting — key off IP + user where available (§2)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const userKey = (req.auth?.user as { id?: string })?.id ?? ip;

  // Auth endpoints strict
  if (pathname.startsWith("/api/auth") || pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/forgot-password" || pathname === "/reset-password") {
    const key = `auth:${ip}:${pathname}`;
    const res = checkRateLimit(key, RatePresets.auth.limit, RatePresets.auth.windowMs);
    if (!res.allowed) {
      const retryAfter = Math.ceil(res.retryAfterMs / 1000);
      return new NextResponse(
        JSON.stringify({ error: "Too many attempts. Please wait and try again.", retryAfter }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter), ...NO_STORE } }
      );
    }
  } else if (!isPublic(pathname)) {
    // General API/authenticated pages — per-user baseline
    const key = `api:${userKey}`;
    const res = checkRateLimit(key, RatePresets.apiGeneral.limit, RatePresets.apiGeneral.windowMs);
    if (!res.allowed) {
      const retryAfter = Math.ceil(res.retryAfterMs / 1000);
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Slow down and try again.", retryAfter }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter), ...NO_STORE } }
      );
    }
  }

  if (isPublic(pathname)) return;

  // Authenticated: add no-store headers so bfcache/disk cache cannot replay
  if (req.auth) {
    const res = NextResponse.next();
    for (const [k, v] of Object.entries(NO_STORE)) res.headers.set(k, v);
    return res;
  }

  // Not authenticated → redirect to sign-in with no-store
  const url = new URL("/sign-in", req.nextUrl.origin);
  url.searchParams.set("callbackUrl", req.nextUrl.pathname);
  const redirectRes = NextResponse.redirect(url);
  for (const [k, v] of Object.entries(NO_STORE)) redirectRes.headers.set(k, v);
  return redirectRes;
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
