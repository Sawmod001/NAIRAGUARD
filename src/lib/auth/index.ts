/**
 * Auth adapter — NG-101
 * Keeps Clerk out of domain/application logic. App code calls `requireAuth()`
 * instead of importing @clerk directly.
 * per docs/03_ARCHITECTURE.md: Infrastructure/auth isolates provider.
 */

export { requireAuth, getAuth, isAuthenticated } from "./helpers";
