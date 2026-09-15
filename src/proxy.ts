import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// NG-101: Protect application routes. Public: /, sign-in, sign-up, privacy, terms.
// Clerk keys missing in Demo CI → allow build to pass (middleware becomes no-op).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  // Next internals + static
  "/_next(.*)",
  "/favicon.ico",
]);

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

export default hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : () => {
      // No-op when keys missing — allows `pnpm build` in Demo without Clerk.
      // Real deploy (NG-101 acceptance) must set keys; otherwise routes remain unprotected.
      return;
    };

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
