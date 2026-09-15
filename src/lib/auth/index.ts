/**
 * Auth boundary — NG-101 Real Prod
 * App code imports from "@/lib/auth", never from "next-auth" or "next-auth/react" directly.
 * Keeps Auth.js isolated per docs/03.
 */
export { requireAuth, getAuth, isAuthenticated } from "./helpers";
export { signUp } from "./actions";
