/**
 * Auth boundary — NG-101 Real Prod
 * App code imports from "@/lib/auth", never from "next-auth" or "next-auth/react" directly.
 * Keeps Auth.js isolated per docs/03. NG-104 adds tenant isolation helpers.
 */
export { requireAuth, getAuth, isAuthenticated } from "./helpers";
export { requireAuthWithOrg, assertMembership, requireOrganization, getAuthorizedOrganizationIds, scopedOrganizationId } from "./authorization";
export { ensurePersonalOrganization, getUserOrganizations, getCurrentOrganization } from "./organization";
export { signUp } from "./actions";
export { requestPasswordReset, resetPassword } from "./password-reset";
