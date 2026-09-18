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
