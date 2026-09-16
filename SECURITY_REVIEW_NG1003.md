# NG-1003 Security Review

**Date:** 2026-09-16
**Branch:** main @ 90be6a8.. (Auth.js JWT)
**Reviewer:** Muse Spark (automated) + human

## Checklist

- [x] **Authentication:** Auth.js v5 Credentials + bcrypt 12, httpOnly secure cookie (JWT), `AUTH_SECRET` server-only, no `NEXT_PUBLIC_` auth secrets
- [x] **Authorization:** `assertMembership` / `requireOrganization` / `scopedOrganizationId` throw `TENANT_FORBIDDEN 403` on cross-tenant, used in all org-scoped queries
- [x] **Tenant isolation:** `User→Membership→Organization`, every tenant query scoped by `organizationId`, `@@unique` on membership, never trust browser `orgId`
- [x] **Secrets:** `.env.local` gitignored, `.env.example` placeholders only, `grep -r "AUTH_SECRET"` only in `src/schemas/env.ts` validation, no `CLERK` leakage (grep 0)
- [x] **Env:** `zod` validated server/client split (`src/schemas/env.ts`), `DATABASE_URL` optional for Demo, required for `APP_MODE=aws`, `RESEND_API_KEY` server-only dormant
- [x] **Input validation:** `zod` via `src/lib/validation/parse.ts` + `src/schemas/*`, `AppError(VALIDATION_FAILED 400)` with field details, no raw ZodError to client
- [x] **Server/client boundaries:** `server-only` in `src/lib/auth/helpers.ts`, `proxy.ts` `auth` guard + `layout` `redirect`, no secrets in client bundle
- [x] **AWS future:** No live AWS yet; documented `IAM Role → STS + externalId`, no long-lived keys, no `AWS_ACCESS_KEY` in repo
- [x] **Destructive actions:** None — read-only MVP, no `delete`/`update` AWS, no `prisma` destructive beyond auth/tenant
- [x] **Logging:** No `console.log` of passwords/tokens, `AppError` strips `cause` from `toJSON`

## Findings
- No `CLERK` refs remain (src, package, env)
- No secrets committed (`git ls-files | xargs grep AUTH_SECRET` — none)
- Build 10 routes, proxy protects `/(app)/*` → 302 to `/sign-in`

## Verdict
**PASS** — no blocking issues. Ready for NG-1004.
