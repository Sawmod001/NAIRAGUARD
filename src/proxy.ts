import { auth } from "@/auth";

/**
 * Auth guard — NG-101 Real Prod
 * Server-enforced (docs/10_SECURITY). Protects /(app)/*, leaves public routes open.
 * Uses secure httpOnly session cookie (Auth.js DB sessions).
 */

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/privacy",
  "/terms",
  "/api/auth",
];

function isPublic(pathname: string): boolean {
  return publicRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // Skip Next internals
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return;
  if (isPublic(pathname)) return;
  // Protected: require session, else redirect to /sign-in
  if (!req.auth) {
    const url = new URL("/sign-in", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
