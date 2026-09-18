# NG-9xx — Hardening Audit
**Branch:** `feature/NG-9xx-hardening` | **Date:** 2026-09-18

## NG-901 Authorization (Tenant Isolation)
- Every `prisma.*` query scoped `where:{organizationId: membership.organizationId}` from `auth()->membership` — verified `src/app/(app)/dashboard, costs, optimizations/[id], activity, layout, components/*` (no `searchParams.organizationId`)
- One fallback `organizationId:"demo"` in `activity/page.tsx:28` for demo rec fetch only (not tenant data leak) — acceptable
- `src/lib/auth/authorization.ts:9` documents never trust browser orgId, `requireAuthWithOrg` + `assertMembership` present

## NG-902 Secrets/Config
- `src/lib/env/client.ts:12` **FIXED** — removed `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` leftover (Clerk removed, was only remaining Clerk ref)
- `.env.example` clean (no Clerk, no `NEXT_PUBLIC_` secrets)
- `src/lib/env/server.ts` validates `process.env` via Zod, server-only
- `process.env.*` only in `server.ts, prisma/client.ts, auth.ts, fx/live-fx-provider` — all server-only
- No secrets in client components

## NG-904 Security Headers + Rate Limit
- `src/proxy.ts:7` has `no-store` on authed + redirect + rate-limit `auth 10/10m, api 100/min → 429 Retry-After`
- `next.config.ts:7` **ADDED** headers: `X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, X-DNS-Prefetch-Control`
- Clerk 0 refs (`grep src` → NO_CLERK_FOUND), package.json no Clerk

## NG-905 Audit Events
- `prisma/schema.prisma: ActivityEvent` with `@@index([org, createdAt])` present, `src/app/(app)/activity/page.tsx` reads it with deterministic demo fallback
- Logging redacted (no credentials) in `PanelErrorBoundary`

## Verdict
All 9xx checks pass after 2 fixes (Clerk env var, security headers). Ready for NG-10xx Playwright + build gate.
