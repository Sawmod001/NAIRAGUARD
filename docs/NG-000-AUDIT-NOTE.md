# NG-000 — Repository Audit Note
**Branch:** `feature/NG-000-audit` | **Date:** 2026-09-18 | **Mode:** No code changes — ground truth only
**Precedence:** repo > PRD/TTD (59a4950) > 07 synthesis > 08 plan > 01-05

---

## 1. Routes (`src/app`)
```
src/app/(app)/activity/page.tsx
src/app/(app)/connections/page.tsx
src/app/(app)/costs/[service]/page.tsx
src/app/(app)/costs/page.tsx
src/app/(app)/costs/resource/[id]/page.tsx
src/app/(app)/dashboard/{page,loading,error,not-found}.tsx
src/app/(app)/layout.tsx
src/app/(app)/optimizations/[id]/page.tsx
src/app/(app)/optimizations/page.tsx
src/app/(app)/settings/page.tsx
src/app/(auth)/sign-in/{page,form}.tsx
src/app/(auth)/sign-up/{page,form}.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/{globals.css, layout.tsx, page.tsx (marketing), onboarding/page.tsx, privacy/page.tsx, terms/page.tsx}
```
**Verdict:** All required App Router routes present. Marketing `/` + Auth + App groups correctly split. No stale Clerk routes.

## 2. Components (`src/components`)
- `app/shell/{app-shell,shell/sidebar,sign-out,app-nav,mobile-menu,topbar,demo-scenario-switcher}` — dark sidebar present, but active state is `bg-zinc-800` not yet accent-bar (gap per 07)
- `dashboard/{count-up, spend-chart (div-bars with y-axis grid + hover tooltip, not recharts), cost-drivers, cost-trend, naira-equivalent, optimization-highlights, spend-overview}` — logic exists, chart not recharts
- `costs/{service-breakdown, region-breakdown, period-comparison}` — present
- `optimizations/{optimization-list, filters, optimization-table, ai-explanation, evidence-display}` — present, table responsive
- `marketing/{navbar, hero-new (6-step story), problem, see, find, understand, how-it-works, recommendation, demo, credibility, why, final-cta, footer}` — full narrative present
- `ui/{panel-error-boundary}` — per-panel error boundary present

## 3. Prisma Schema (`prisma/schema.prisma`)
```prisma
User, Account, Session, VerificationToken (Auth.js)
Organization {memberships, activityEvents}
Membership {userId, organizationId, role="owner", @@unique + @@index}
ActivityEvent {organizationId, type, title, description?, resourceId?, createdAt, @@index(org, createdAt)}
HealthCheck
```
**Verdict:** Auth.js + Neon PG correct, `ActivityEvent` restored (was missing in previous Vercel build, now fixed `59a4950`), tenant isolation explicit, no CostSnapshot yet (deferred per 05). Indexes present.

## 4. Clerk Check
- `package.json` — no `@clerk/*`, only `@auth/prisma-adapter 2.11.3 + next-auth 5.0.0-beta.32`
- `grep -r Clerk src/` — **NO_CLERK_FOUND**
- No Clerk middleware/provider/env vars
**Verdict:** Clerk fully removed per user answer #8 — no action.

## 5. Chart Library (Recharts vs div-bars)
- `package.json` — no `recharts`, no `shadcn` installed
- `src/components/dashboard/spend-chart.tsx` — custom div-bars with manual y-axis gridlines + `$` ticks + hover tooltip (not recharts), uses `useState hoverIdx`
**Verdict:** Gap confirmed per 07 table — TTD said deferred, 01-05 + 08 say required. This is NG-DASH-02.

## 6. Demo Scenarios (`data/scenarios`)
```
balanced-startup.json (Balanced Startup, $1,378, 42% EC2, 2 recs)
waste-heavy-startup.json
ec2-heavy-startup.json
storage-heavy-startup.json
fx-pressure.json
index.json (lists 5)
```
**Verdict:** All 5 required scenarios exist as JSON, deterministic, internally consistent. Controlled by `src/infrastructure/providers/demo/registry.ts` with `REQUIRED_SCENARIOS` + 9 edge scenarios (no-recommendations, throttled etc). Demo adapter feeds same domain model.

## 7. Proxy / Auth Boundary (`src/proxy.ts`)
- Public routes: `/, /sign-in, /sign-up, /privacy, /terms, /onboarding, /api/auth` — correct
- Auth check: `auth()` JWT httpOnly, server-side (not client useEffect)
- **no-store headers:** `Cache-Control: no-store, must-revalidate, Pragma: no-cache, Expires: 0` on authed + redirect — present (hardening fix)
- **Rate limiting:** `src/lib/rate-limit.ts` sliding-window in-memory, `proxy.ts` checks `auth 10/10m per IP:path → 429 Retry-After` + `api 100/min per user`, `src/lib/auth/actions.ts` also rate-limits `signUp` per IP — present

## 8. Domain & Providers
- Interfaces `CostProvider, OptimizationProvider, ResourceProvider, FXProvider, AIProvider` present in `src/infrastructure/providers/*`
- Domain `src/domain/{costs,optimizations,fx,finops}` pure functions, `toNairaEquivalent` `Math.round*100`, `prioritizeRecommendations`, `aggregateSavings` — business logic separated from UI
- FX `1550` demo-fixture with provenance, AI `MockAIProvider` structured Zod, graceful failure — aligned

## 9. Money Representation Gap
Spec `02:99` says `cents/kobo integer minor units` + stored FX rate, but current `domain/fx/conversion.ts` uses `float + Math.round(USD*rate*100)/100`. Agreed in Q5 to migrate to integer minor units in this pass.

## 10. Typography / Motion / Homepage
- Stack shipped: `Clash Display + Satoshi + JetBrains Mono` via Fontshare `api.fontshare.com/v2/css?...` — correct per 08 Part A
- Author/General Sans not yet added (Q3 approved)
- Motion: `Framer Motion` for UI, `GSAP` for homepage choreography, no Spline — correct per 08

## 11. Net Verdict
Only substantive gap is **dashboard visual/component layer (NG-DASH-01..05)** per 07. Everything else (auth, DB, demo parity, money calc pattern, AI) aligned or needs only audit confirmation, not redesign. Homepage is refinement-only (copy tightening, rhythm, motion audit per 08).

**Next:** Proceed to `08` tickets in order, per-ticket branch, touching only listed files.
