# NG-10xx — Release Gate
**Branch:** `feature/NG-10xx-release` | **Date:** 2026-09-18
**Gate:** `pnpm typecheck` ✓, `pnpm build` ✓ (13 routes, Turbopack), `pnpm test` ✓ (5/5 finops), security headers verified

## Build
```
Route (app)
○ /, ○ /_not-found, ƒ /activity, ƒ /api/auth, ƒ /connections, ƒ /costs, ƒ /costs/[service], ƒ /costs/resource/[id], ƒ /dashboard, ○ /onboarding, ƒ /optimizations, ƒ /optimizations/[id], ○ /privacy, ƒ /settings, ƒ /sign-in, ○ /sign-up, ○ /terms
ƒ Proxy (Middleware)
```

## Checks
- Typecheck: pass (no TS errors after cents migration + Card + recharts)
- Build: pass (prisma generate && next build)
- Tests: 5/5 finops (usd→kobo, savings aggregate)
- Hardening: no-store + rate-limit present, security headers added
- Playwright: 10 critical flows documented in `04-UX-ENGINEERING-TESTING.md:299` — manual gate pending (requires `npx playwright install` + local run, deferred per targeted validation rule)

## Ready to Merge
All 08 tickets through NG-HOME-03 + NG-201 + NG-9xx complete. Merge to `main` after review, then Vercel auto-deploy.

## Re-verification — NG-REL-01 (production direction track)
**Scope:** `main` through Phase 9 plus stacked SEC-01…SEC-04 (merged separately).
**Gate:** `npm run release:check` (tsc + vitest + prisma validate) — see ticket for run log.

### Checks (executed)
- Typecheck: pass, zero errors.
- Tests: 104/104 across 21 unit files (auth, tenant isolation, AWS lifecycle/IAM/STS/registry, sync runner/retry, cost/FX/finding snapshots, coherence, freshness, motion).
- Prisma validate: schema valid (requires `DATABASE_URL` in env — Vercel/CI provides it).
- Migrate status: database schema is up to date (2 historical migration files; schema applied via `db push`).
- Routes (17 pages + api/auth + proxy): `/`, `/activity`, `/connections`, `/costs`, `/costs/[service]`, `/costs/resource/[id]`, `/dashboard`, `/forgot-password`, `/onboarding` (auth-guarded), `/optimizations`, `/optimizations/[id]`, `/privacy`, `/reset-password`, `/settings`, `/sign-in`, `/sign-up`, `/terms`. Route states: global-error, root not-found, app loading/error, dashboard trio, optimizations not-found.

### Security review rollup (NG-SEC-01…04)
- Open-redirect on post-auth callback: fixed + tested.
- Tenant isolation: 75 data-access sites audited clean; enforcement core now tested.
- Credentials: no stored keys, clean logs, client env boundary intact, AUTH_SECRET strength floor.
- Money: cents/kobo authoritative everywhere; malformed evidence rejected; conversions integer-settled and tested.

### Still gated outside this ticket
- Production `next build`: runs on Vercel (local RAM insufficient) — preview must stay green.
- Live AWS proof: STS/sync/adapters need a real role and observed first sync.
- Playwright critical flows: still manual (see 04-UX-ENGINEERING-TESTING).
- CSP headers, multi-org current-org determinism: noted follow-ups.
- Open PR branches (SEC-01…04, this gate): merge in order, then Vercel auto-deploys.
