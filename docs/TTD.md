# NairaGuard — Technical Design Document (TTD)
**Version:** 2.0 (Comprehensive) | **Date:** 2026-09-18 | **Status:** Implemented to `main@59a4950` | **Deploy:** `https://nairaguard-ng.vercel.app` (Vercel + Neon)
**Stack:** Next.js 16.3.5 (Turbopack), React 19.2.3, TypeScript 5.8 strict, Prisma 6.14 + PostgreSQL, Auth.js v5 (NextAuth beta 32), Tailwind 4.1, Zod 4.6, Vitest 5, bcryptjs 3, server-only 0.0.1
**Related:** `docs/PRD.md` (v2), `docs/01`→`24`, Hardening + Dashboard specs | **Repo:** `Sawmod001/NAIRAGUARD`

---

## Table of Contents
1. [Overview & Goals](#1-overview--goals)
2. [Guiding Principles & ADRs](#2-guiding-principles--adrs)
3. [System Context (C4 L1/L2)](#3-system-context-c4-l1l2)
4. [High-Level Architecture & Request Flow](#4-high-level-architecture--request-flow)
5. [Project Structure & Module Map](#5-project-structure--module-map)
6. [Technology Stack & Rationale](#6-technology-stack--rationale)
7. [Provider Abstraction (Core)](#7-provider-abstraction-core)
8. [Domain Layer (Financial Truth)](#8-domain-layer-financial-truth)
9. [Application Layer (Orchestration)](#9-application-layer-orchestration)
10. [Data Model & Prisma Schema (Full)](#10-data-model--prisma-schema-full)
11. [API & Route Design (Next.js App Router)](#11-api--route-design-nextjs-app-router)
12. [Authentication & Session (Auth.js v5)](#12-authentication--session-authjs-v5)
13. [Middleware, Hardening & Rate Limiting](#13-middleware-hardening--rate-limiting)
14. [FX Service & Naira Conversion](#14-fx-service--naira-conversion)
15. [AI Explanation Service](#15-ai-explanation-service)
16. [Frontend Architecture (RSC, Client Boundaries, State)](#16-frontend-architecture-rsc-client-boundaries-state)
17. [Presentation: Marketing vs Dashboard](#17-presentation-marketing-vs-dashboard)
18. [Error Handling, Logging & Observability](#18-error-handling-logging--observability)
19. [Security Threat Model & Controls](#19-security-threat-model--controls)
20. [Validation & Input Sanitization](#20-validation--input-sanitization)
21. [Testing Strategy (Layers)](#21-testing-strategy-layers)
22. [Build, Env & Deployment (Vercel)](#22-build-env--deployment-vercel)
23. [Performance & Scalability](#23-performance--scalability)
24. [Live AWS Adapter (Future)](#24-live-aws-adapter-future)
25. [Sequence Diagrams (Critical Flows)](#25-sequence-diagrams-critical-flows)
26. [Trade-offs & Known Limitations](#26-trade-offs--known-limitations)
27. [Appendices](#27-appendices)

---

## 1. Overview & Goals
**Goal:** Scale cleanly `Demo → Live AWS → multi-account` without rewrite. Key invariant: `UI components must not know how AWS works` (`03:11`). Financial truth from provider/deterministic calc, not AI.
**Quality Bars:** Types pass, lint pass, tests pass where relevant, error/empty/loading states, server authz, responsive, no duplication, docs updated (`15:158`).

## 2. Guiding Principles & ADRs (`19_DECISIONS.md`)
| ADR | Decision | Reason |
|-----|----------|--------|
| ADR-001 | Demo First before Live AWS | No personal billing dependency, deterministic tests, portfolio-ready, same contracts later support AWS |
| ADR-002 | Provider Interfaces | Prevents AWS SDK coupling throughout app (`03:73` DemoProvider/AWSProvider → domain → UI) |
| ADR-003 | Prisma + PostgreSQL | Relational fits product, type safety, migrations, filtering, multi-tenant growth |
| ADR-004 | Auth.js v5 + Prisma PG httpOnly JWT (supersedes Clerk cccc440) | App-owned identity, avoids vendor lock-in, server-only `AUTH_SECRET`, `trustHost`, `credentialsSchema` Zod |
| ADR-005 | AI not financial authority | LLM hallucinations risk; provider + deterministic remain authoritative |
| ADR-006 | Read-only MVP | Security + scope — no AWS mutation |
| ADR-007 | Creative homepage, conservative dashboard | Marketing vs operational UX jobs differ |

**Engineering Principles:** `12_CODING_STANDARDS.md` — strict TS, no `any`, server components default, thin route handlers, Prisma singleton (`lib/prisma/client.ts` avoids multiple instances in dev per `12:40`), AWS SDK only in adapters, money avoids float errors (store original USD + converted NGN, `Math.round(*100)/100`), typed domain errors, reusable components, a11y, reduced-motion.

## 3. System Context (C4 L1/L2)
**L1 Context:** User (Founder/Engineer/Finance) ↔ NairaGuard (Next.js + Postgres) ↔ External: AWS (future Cost Explorer/Hub/Optimizer via IAM Role STS), FX Providers (ExchangeRate.fun/currencyapi), AI Provider (mock → live), Resend (email dormant).
**L2 Container:** Browser (marketing + app shell) → Next.js Server (App Router, Middleware `proxy.ts`, API `/api/auth/[...nextauth]`), Application Services, Domain Engine, Infrastructure Providers, Prisma → Neon Postgres. Vercel hosts Next.js, Neon hosts DB.

## 4. High-Level Architecture & Request Flow (`03:15`)
```
┌──────────────────────┐
│     Next.js UI       │  (Server + Client, App Router)
└──────────┬───────────┘
           │ Application Layer (use cases, authz, sync workflows)
  ┌────────┼────────┐
  │        │        │
CostSvc  SavingsSvc FX Svc
  └────────┼────────┘
           │ Provider Interfaces
 ┌─────────┼──────────┐
 │         │          │
Mock AWS  AWS Live  Mock/Live FX/AI
 │         │          │
 └─────────┼──────────┘
           │ FinOps Domain Engine (deterministic)
           │ AI Explanation (structured)
           │ PostgreSQL (Prisma)
```
**Request Flow (Dashboard):** `GET /dashboard?scenario=balanced-startup&...` → `proxy.ts` (rate limit + auth check + no-store headers) → `src/app/(app)/layout.tsx` (auth + membership lookup + first-run redirect if `ActivityEvent` 0) → `src/app/(app)/dashboard/page.tsx` (Zod parse query → `DemoCostProvider.getCosts({orgId, periodDays})` → `normalizeCostResult` → `DemoOptimizationProvider.getRecommendations` → `prioritizeRecommendations` → `toNairaEquivalent` + `aggregateSavings` → render panels wrapped in `PanelErrorBoundary` + client `CountUp`/`SpendChart`).

## 5. Project Structure & Module Map (`14_PROJECT_STRUCTURE.md`, actual `src/**/*`)
```
src/app/
  (marketing)/page.tsx → HeroNew, Problem, See, Find, Understand, HowItWorks, Recommendation, Demo, Credibility, Why, FinalCTA, Footer
  (auth)/sign-in|sign-up/{page,form}
  (app)/{dashboard/{page,loading,error,not-found}, costs/{page,[service]/page,resource/[id]/page}, optimizations/{page,[id]/page}, activity/page, connections/page, settings/page, layout.tsx}
  onboarding/page.tsx, privacy/page, terms/page, layout.tsx, globals.css
  api/auth/[...nextauth]/route.ts
src/components/{ui/panel-error-boundary, marketing/*, dashboard/count-up,spend-chart, costs/service-breakdown|region-breakdown|period-comparison, optimizations/optimization-list|filters|ai-explanation|evidence-display, app/shell/app-shell|sidebar|sign-out|app-nav|mobile-menu|demo-scenario-switcher}
src/domain/{costs/types|normalize|index, optimizations/types|prioritize|index, fx/types|conversion|index, finops/savings|index}
src/infrastructure/providers/{cost-provider, optimization-provider, resource-provider, fx-provider, ai-provider, demo/{cost-provider, optimization-provider, resource-provider, fx-provider, registry,index}, fx/cached-fx-provider|live-fx-provider, ai/mock-ai-provider, aws/.gitkeep}
src/lib/{prisma/{client,index}, auth/{actions,authorization,helpers,organization,index}, validation/*, errors/{app-error,codes,handler,index}, rate-limit, env/{server,client,index}, config, logging/.gitkeep}
src/schemas/{auth, demo, common, ai, query, env}
prisma/schema.prisma, data/scenarios/{balanced-startup, waste-heavy-startup, ec2-heavy-startup, storage-heavy-startup, fx-pressure, index}.json, tests/unit|integration|e2e|contracts
```

## 6. Technology Stack & Rationale
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16.3.5 App Router, Turbopack | RSC default, server auth, `next/font` not needed (Fontshare API), `next dev` breaking changes note in `AGENTS.md:21` |
| Language | TypeScript 5.8 strict, no `any`, Zod at boundaries | Type safety per `12:05` |
| DB | Prisma 6.14 + PostgreSQL (Neon) | Relational, migrations, Prisma singleton pattern (`12:40`) |
| Auth | Auth.js v5 `next-auth@beta.32` + `@auth/prisma-adapter` + `bcryptjs` | Own identity, httpOnly JWT, `PrismaAdapter` sessions |
| Styling | Tailwind 4.1 + `@tailwindcss/postcss`, PostCSS | Tokens via CSS vars |
| Validation | Zod 4.6 | `signUpSchema`, `dashboardQuerySchema`, `demoDatasetSchema` |
| Test | Vitest 5 + Testing Library + Playwright (future) | `11_TESTING.md` layers |
| Fonts | Fontshare `clash-display@400,600,700 + satoshi@400,500,700` + `JetBrains Mono` | `24_TYPOGRAPHY` |

## 7. Provider Abstraction (Core, `03:46`)

### 7.1 Interfaces
```ts
// cost-provider.ts:45
type CostQuery = { organizationId: string; accountId?: string|null; periodDays?: number; from?: string; to?: string }
type CostDailyPoint = { date: string; amountUsd: number }
type CostServiceBreakdown = { service: string; amountUsd: number; percentage: number }
type CostRegionBreakdown = { region: string; amountUsd: number; percentage: number }
type CostResult = { organizationId, accountId:string|null, currency:"USD", periodDays, totalUsd, daily:CostDailyPoint[], serviceBreakdown:CostServiceBreakdown[], regionBreakdown?: CostRegionBreakdown[], source:string, observedAt:string }
interface CostProvider { getCosts(q: CostQuery): Promise<CostResult> }

// optimization-provider.ts
interface OptimizationProvider { getRecommendations(q: {organizationId}): Promise<NormalizedRecommendation[]>; getRecommendationById(id,q) }
type NormalizedRecommendation = {
  source: string; externalId: string; resourceId: string; resourceType: string; actionType: string; region: string;
  currentConfiguration: string; recommendedConfiguration: string;
  estimatedMonthlyCostUsd: number; estimatedMonthlySavingsUsd: number; savingsPercentage?: number;
  effort: "Low"|"Medium"|"High"; restartRequired: boolean; rollbackPossible: boolean; status?: string; observedAt: string;
  nairaGuardScore: number; rank: number
}

// resource-provider.ts
interface ResourceProvider { getResource(q:{organizationId, resourceId}): Promise<{resourceId, resourceType, region, resourceArn, configuration, utilization?:{cpuAverage, memoryAverage, lookbackDays}, observedAt}> }

// fx-provider.ts
interface FXProvider { getRate(): Promise<{base:"USD", quote:"NGN", rate:number, provider:string, observedAt:string, expiresAt?:string}> }

// ai-provider.ts
interface AIProvider { explain(input:{recommendation:{source,resourceType,...}, fx:{rate, observedAt}|null, nairaImpact:{estimatedMonthlySavingsNgn}|null}): Promise<{summary, whyItMatters, recommendedNextStep, businessImpact, technicalImpact, risks:string[], priority, confidence, assumptions:string[]}> }
```

### 7.2 Demo Implementations
`DemoCostProvider(scenarioId)` loads `data/scenarios/<id>.json` via `fs + path` (`registry.ts:40` `dataRoot()` supports `DEMO_DATA_ROOT` override for tests), validates `demoDatasetSchema`, slices `daily` by `periodDays`, returns `CostResult` with `source: "DemoCostProvider"`. `DemoOptimizationProvider` similar, filters by `organizationId` (demo ignores but future tenant-aware). `DemoResourceProvider` returns ARN-like `arn:aws:ec2:eu-west-1:999977463648:instance/i-0demo001`. `DemoFxProvider` returns `usdNgn:1550, provider:"demo-fixture", observedAt:"2026-09-15T00:00:00Z"`. `MockAIProvider` returns deterministic Zod-validated object grounded in evidence, never invented savings.

### 7.3 Registry & Edge Scenarios (`registry.ts:10`)
`REQUIRED_SCENARIOS = [balanced-startup, waste-heavy-startup, ec2-heavy-startup, storage-heavy-startup, fx-pressure]` + `EDGE_SCENARIOS = [no-recommendations, aws-access-denied, provider-throttled, provider-unavailable, fx-unavailable, ai-unavailable, stale-data, malformed-provider-response, db-failure]` → `getDemoDataset` throws `EDGE_SCENARIO:<id>` for provider to map to `AppError` (`ErrorCode.AWS_*` per `17:36`).

## 8. Domain Layer (Financial Truth, `07_FINOPS_DOMAIN_RULES.md`)
Hierarchy `Provider > Deterministic > AI` (`07:03`). Never reverse.
- **Savings:** `if provider says 120 USD and rate 1550 → 186,000 NGN` (`07:13`). Deterministic `convertUsdToNgn` / `toNairaEquivalent` (`conversion.ts:9` `Math.round(usd*rate*100)/100` avoids float errors).
- **Total Potential Savings:** Do not blindly sum if Hub marks mutually exclusive; preserve source aggregation semantics (`07:27`).
- **Prioritization:** `prioritizeRecommendations(recs)` sorts by `nairaGuardScore = savingsImpact*0.5 + effortInverse*0.2 + restartPenalty*0.1 + rollbackBonus*0.1 + confidence*0.1` (conceptual, `07:45`).
- **Display:** Every USD must have USD + NGN + rate + timestamp/provider; `Estimated Naira equivalent: ₦X at ₦Y/USD (source, date) — USD $Z` (`conversion.ts:27`). Freshness `Cost data synced 2h ago` (`07:82`).

## 9. Application Layer (Orchestration)
Thin handlers: `src/app/(app)/dashboard/page.tsx` orchestrates `DemoCostProvider` → `normalizeCostResult` (validates `amountUsd` finite, percentages `sum≈100%`) → `aggregateSavings(recs)` (preserves Hub semantics, `savings.ts`) → `prioritize` → `toNairaEquivalent` for totals. Cost detail `src/app/(app)/costs/page.tsx` same but for `costs` route. Optimizations `src/components/optimizations/optimization-list.tsx` filters `effort/region` deterministically + sorts `savings/percentage/effort` with stable rank. All queries `where: {organizationId}` from `prisma.membership.findFirst({where:{userId}})`.

## 10. Data Model & Prisma Schema (Full, `05_DATA_MODEL.md`)
```prisma
// prisma/schema.prisma (production, `main@59a4950`)
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
model HealthCheck { id String @id @default(cuid()); createdAt DateTime @default(now()); status String @default("ok"); @@map("health_checks") }
model User { id String @id @default(cuid()); name String?; email String @unique; emailVerified DateTime?; image String?; password String?; accounts Account[]; sessions Session[]; memberships Membership[]; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; @@map("users") }
model Account { userId String; type String; provider String; providerAccountId String; refresh_token String? @db.Text; access_token String? @db.Text; expires_at Int?; token_type String?; scope String?; id_token String? @db.Text; session_state String?; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; user User @relation(fields:[userId], references:[id], onDelete:Cascade); @@id([provider, providerAccountId]); @@map("accounts") }
model Session { sessionToken String @unique; userId String; expires DateTime; user User @relation(fields:[userId], references:[id], onDelete:Cascade); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; @@map("sessions") }
model VerificationToken { identifier String; token String; expires DateTime; @@id([identifier, token]); @@map("verification_tokens") }
model Organization { id String @id @default(cuid()); name String; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; memberships Membership[]; activityEvents ActivityEvent[]; @@map("organizations") }
model Membership { id String @id @default(cuid()); userId String; organizationId String; role String @default("owner"); createdAt DateTime @default(now()); user User @relation(fields:[userId], references:[id], onDelete:Cascade); organization Organization @relation(fields:[organizationId], references:[id], onDelete:Cascade); @@unique([userId, organizationId]); @@index([userId]); @@index([organizationId]); @@map("memberships") }
model ActivityEvent { id String @id @default(cuid()); organizationId String; type String; title String; description String?; resourceId String?; createdAt DateTime @default(now()); organization Organization @relation(fields:[organizationId], references:[id], onDelete:Cascade); @@index([organizationId, createdAt]); @@map("activity_events") }
// Future (deferred per 05:99): CostSnapshot{organizationId, accountId, periodStart, periodEnd, amountUsd, fxRate, amountNgn, source, observedAt}, CostBreakdown{snapshotId, service, region, amountUsd, percentage}, Recommendation{externalId indexed, resourceArn...}, AIAnalysis{recommendationId, summary...}, FxRate{base, quote, rate, provider, observedAt, expiresAt}, Budget, Alert
```
**Ownership:** Organization owns snapshots/breakdowns/recommendations/AI/Fx. Every tenant query scoped `where:{organizationId}` from membership, never client-supplied. Indexes `externalId`, `organizationId,createdAt`. Money stored `Decimal` future vs `Float` now + `Math.round`.

## 11. API & Route Design (Next.js App Router)
- **Public:** `GET /` → marketing `Navbar + HeroNew (6 steps) + Problem + See + Find + Understand + HowItWorks + RecommendationShowcase + Demo + Credibility + Why + FinalCTA + Footer`; `/sign-in|sign-up` → forms (`sign-in/form.tsx` credentials `signIn("credentials")`, `sign-up/form.tsx` → `signUp` server action + auto `signIn`); `/privacy|terms` static.
- **App (RSC, dynamic `ƒ`):** `GET /dashboard?scenario&...` (server, `dashboardQuerySchema` Zod), `GET /costs?period&scenario`, `GET /costs/[service]?scenario`, `GET /costs/resource/[id]?scenario`, `GET /optimizations?effort&region&sort&scenario` (server wrapper `OptimizationList`), `GET /optimizations/[id]?scenario` (detail + `EvidenceDisplay + AIExplanationCard`), `GET /activity?scenario` (DB `activityEvent` with demo fallback), `GET /connections, /settings` (profile/workspace/preferences/security). `/api/auth/[...nextauth]` NextAuth route.
- **Proxy (Middleware) `src/proxy.ts:7`:** `matcher: "/((?!_next|[^?]*\\.(?:...)).*)"` — public routes skip, else auth check + rate limit + `no-store` headers.

## 12. Authentication & Session (Auth.js v5, `src/auth.ts:24`)
```ts
adapter: PrismaAdapter(prisma), session: {strategy:"jwt"} (JWT + httpOnly secure cookie, Prisma users still), trustHost:true, secret: process.env.AUTH_SECRET
providers: [Credentials({credentials:{email,password}, authorize: async (creds) => {
  const {email,password}=credentialsSchema.parse(creds); // Zod email+min8
  const user=await prisma.user.findUnique({where:{email:toLower}}) 
  if(!user.password || (requireEmailVerification && !emailVerified)) return null
  if(!await bcrypt.compare(password, user.password)) return null
  // ensure org idempotent for pre-NG-103 users
  if(!await prisma.membership.findFirst({where:{userId:user.id}})) { create org + membership owner }
  return {id:user.id, email, name}
}})]
callbacks: { jwt: copy id, session: copy id }
pages: {signIn:"/sign-in"}
```
Sign-up server action `src/lib/auth/actions.ts:16` `signUpSchema` Zod, `bcrypt.hash 12 rounds`, transaction `User+Org+Membership`, throws `AppError(DB_FAILURE)` on fail. Email verification dormant (`EMAIL_FROM` not set). Cookies `__Host-authjs.*` `HttpOnly Secure SameSite=Lax` (via Auth.js).

## 13. Middleware, Hardening & Rate Limiting (`03_TECHNICAL_HARDENING_SPEC.md`)
- **bfcache Fix (#1):** `proxy.ts` returns `NextResponse.next()` with `Cache-Control: no-store, must-revalidate, Pragma: no-cache, Expires: 0` for authed routes; redirect also no-store. Server guard (not client `useEffect`). Sign-out client clears `sessionStorage/localStorage/caches` (`sign-out.tsx:6`) + server sets cookie expiry past (Auth.js).
- **Rate Limiting (#2):** `src/lib/rate-limit.ts:1` sliding-window in-memory `Map<string, number[]>` (Redis for multi-instance). Presets: `auth 10/10m` per `auth:${ip}:${path}`, `apiGeneral 100/min` per `api:${userId|ip}`, `cost 60/min`. Middleware checks `x-forwarded-for`/`x-real-ip`, returns `429 + Retry-After` JSON with non-technical message. `signUp` action also checks `action:signUp:${ip}`.
- **Tenant Isolation:** Every query `where:{organizationId}` from `auth()→membership`, never `req.query.orgId`.
- **CSRF:** Auth.js handles `authjs.csrf-token` + `callback-url`.

## 14. FX Service & Naira Conversion
`src/domain/fx/conversion.ts:9`:
```ts
toNairaEquivalent(usd, fx): {usd: round(usd*100)/100, naira: round(usd*fx.rate*100)/100, rate: fx.rate, observedAt, source, label:"Estimated Naira equivalent"}
formatNairaEquivalent: `Estimated Naira equivalent: ₦${naira} at ₦${rate}/USD (${source}, ${date}) — USD $${usd}`
```
`fx/types.ts` `FxQuote {rate, provider, observedAt, expiresAt}`, `NairaEquivalent`. Providers: `DemoFxProvider` fixture `1550` `2026-09-15`, `LiveFxProvider` calls `FX_PROVIDER_URL`, `CachedFxProvider` wraps with `expiresAt`, fallback `cached → last-known stale warning → demo fixture`.

## 15. AI Explanation Service (`08_AI_SPEC.md`)
Mock `MockAIProvider.explain({recommendation:{source,resourceType,resourceId,region,current→recommended, cost, savings, effort, restart, rollback, actionType}, fx, nairaImpact})` → Zod-validated `{summary, whyItMatters, recommendedNextStep, businessImpact, technicalImpact, risks[], priority:"Low"|"Med"|"High", confidence, assumptions[]}`. Grounded: `AI explains evidence, not numbers`. Failure: `catch` → `AI explanation unavailable` amber panel, deterministic savings still visible. Live future: Vercel AI SDK `Output.object()` behind same interface.

## 16. Frontend Architecture (RSC, Client Boundaries, State)
- **Default RSC:** `dashboard/page.tsx`, `costs/page.tsx`, `optimizations/[id]/page.tsx` all `async` server components.
- **Client islands:** `sign-in/form, sign-up/form, spend-chart.tsx, count-up.tsx (CountUp), demo-scenario-switcher, mobile-menu, sign-out, navbar, hero-new` marked `"use client"` only where interactivity needed.
- **No Prop Drilling:** Providers not passed via props beyond server → client boundary.
- **Separation:** `domain/*` pure functions unit-testable (`finops.test.ts` 5 tests), no JSX; `infrastructure/providers` isolates SDK; `lib/*` facades.

## 17. Presentation: Marketing vs Dashboard
- **Marketing:** Black `#0E0E0F` hero, editorial typography `Clash Display + Satoshi + JetBrains Mono` via Fontshare `api.fontshare.com/v2/css?f[]=clash-display@400,600,700&f[]=satoshi@400,500,700`, controlled whitespace, `hero-new.tsx` 6-step story `AWS resources → spend → waste → rightsizing → savings → ₦` with `clipPath` + `grayscale` + interval 1400ms, respects `prefers-reduced-motion`.
- **Dashboard:** Warm paper `#FAFAF9` canvas, black nav, red `#E8622C` accent only for attention/selected (savings top-border, chart hover, active pill, nav accent bar), flat border-driven panels `8px`, tabular-nums, no purple gradients/glassmorphism/rainbow. Global `globals.css:4` tokens mapped.

## 18. Error Handling, Logging & Observability
`src/lib/errors/{app-error, codes, handler}` `AppError {code: ErrorCode, message, cause}`; `ErrorCode: UNAUTHORIZED, DB_FAILURE, AWS_ACCESS_DENIED, THROTTLED, NO_DATA, RATE_LIMITED` etc. UI: `src/app/(app)/dashboard/{loading,error,not-found}.tsx` per-panel skeletons (not spinner), `PanelErrorBoundary` catches malformed data without blanking page. Logging `src/lib/logging/.gitkeep` future: `type, orgId, correlationId, provider status` never `API keys / AWS secret / tokens / credential payloads`. Monitoring basic uptime/error-rate pending (Hardening #3).

## 19. Security Threat Model & Controls (`10_SECURITY.md`)
STRIDE:
- Spoofing → Auth.js httpOnly Secure Lax CSRF, bcrypt12
- Tampering → `prisma.$transaction` for sign-up, Zod at boundary `signUpSchema, dashboardQuerySchema`
- Repudiation → `ActivityEvent` audit trail per org
- InfoDisclosure → tenant scoping, `no-store`, no `NEXT_PUBLIC_` secrets, AWSSecret never logged
- DoS → rate limiting + Cost Explorer cached not per-render
- Elevation → `role: owner` now, future checks `membership.role`.

## 20. Validation & Input Sanitization
Every client filter validated server-side: `scenario` regex `^[a-z0-9-]+$` max64, `period 7|30|90`, `effort Low|Med|High`, `region string`. `prisma` parameterized ORM, no raw SQL. Money `isFinite` check before `toNairaEquivalent`.

## 21. Testing Strategy (`11_TESTING.md`)
- **Unit** Vitest: `usd→ngn, savings aggregate, prioritization, fx fallback, normalization`.
- **Provider Contract:** `tests/contracts` Mock must satisfy same `CostResult` shape as future AWS.
- **Integration:** DB operations, authz boundaries, scenario switching, provider failures.
- **AI:** Mock deterministic, Zod schema, missing fields, `AI cannot alter financial truth`.
- **E2E** Playwright: signup→dashboard→scenario→costs→optimizations→detail→NGN→empty→401.
- **CI Gates:** `typecheck, lint, test, build, e2e smoke` before merge (`15:60`).

## 22. Build, Env & Deployment (Vercel)
- **Scripts:** `dev: next dev --turbopack`, `build: prisma generate && next build` (fix for Vercel), `start: next start`, `db:generate|validate|migrate`.
- **Env (`18_ENVIRONMENT.md`):** `APP_MODE=demo|aws, AI_MODE=mock|live, FX_MODE=demo|live`; Auth `AUTH_SECRET, AUTH_URL, DATABASE_URL (Neon postgresql://neondb_...), RESEND_API_KEY, EMAIL_FROM`; AI `AI_PROVIDER_API_KEY`; FX `FX_PROVIDER_API_KEY`. `.env.example` safe, never commit `.env.local`.
- **Vercel:** Project `abdusawmod/nairaguard-ng` (`prj_1Tqn...`), linked `main` auto-deploy, env `DATABASE_URL/AUTH_SECRET/AUTH_URL/NEXT_PUBLIC_APP_URL` set Production. Local `pnpm dev` → `http://localhost:3000`, Vercel → `https://nairaguard-ng.vercel.app` (`https://nairaguard-3dpqc2zai...` inspector). Build `✓ Compiled 12.8s + TypeScript 6.7s`.

## 23. Performance & Scalability
AppShell `sticky top`, demo provider `fs.readFileSync` + Zod parse (sync but small JSON 30d), `useEffect` interval cleanup, `requestAnimationFrame` for CountUp, no `use client` everywhere, lazy images, `box-sizing: border-box`. Cost Explorer calls cached, not per-render. Rate limiting protects AWS metering.

## 24. Live AWS Adapter (Future, `17_LIVE_AWS_LATER.md`)
Flow: User `Connect AWS` → IAM Role + STS `AssumeRole` + `externalId` least-privilege `CostExplorerReadOnly, CostOptimizationHubReadOnly, ComputeOptimizerReadOnly` → verify → `AWS CostProvider` calls `CostExplorer.getCostAndUsage` + `Hub.listRecommendations` + `Optimizer.getEC2Recommendations` → normalize to `CostResult/NormalizedRecommendation` → same domain/UI. Must handle `AccountUnavailable, ServiceUnavailable, FeatureNotEnabled, RecommendationsNotReady` with empty/stale UI.

## 25. Sequence Diagrams (Critical Flows)
```mermaid
sequenceDiagram
  participant U as User
  participant P as proxy.ts
  participant A as Auth.js
  participant D as DemoProvider
  participant Dom as Domain
  participant UI as Dashboard
  U->>P: GET /dashboard?scenario=balanced
  P->>P: rateLimit check (auth?10/10m)
  P->>A: auth() validate JWT cookie
  alt not authed
    P-->>U: 307 /sign-in + no-store
  else authed
    P->>UI: NextResponse.next()+no-store
    UI->>D: getCosts({orgId, periodDays})
    D-->>Dom: CostResult
    Dom->>Dom: normalize + aggregate + prioritize + toNaira
    UI-->>U: HTML (CountUp client, SpendChart, Bars)
  end

sequenceDiagram
  participant U
  participant S as sign-up form
  participant SA as signUp action
  participant DB as Prisma
  U->>S: submit email/password
  S->>SA: signUp({email,password,name})
  SA->>SA: rateLimit action:signUp:ip 10/10m
  SA->>SA: Zod signUpSchema
  SA->>DB: transaction User+Org+Membership
  SA-->>S: {ok:true}
  S->>A: signIn credentials
  A->>DB: findUnique + bcrypt.compare + ensureMembership
  A-->>U: redirect /onboarding
```

## 26. Trade-offs & Known Limitations
- In-memory rate limit single-process (Redis needed for scale)
- Prisma floats for money (future `Decimal`)
- `headers()` in layout for first-run check uses `x-pathname` heuristic (middleware header injection future)
- Turbopack cache 700MB on C: (cleaned to 2.1GB free)
- Email verification dormant until domain verified

## 27. Appendices
**A. Prisma ERD:** `User 1—* Membership *—1 Organization 1—* ActivityEvent`
**B. Env Template:** `docs/18` modes `demo/mock/demo` etc.
**C. Route Table:** Marketing `/` vs App `/dashboard` split via `(marketing)`, `(auth)`, `(app)` route groups.
**D. Demo Scenario Totals:** Balanced `daily sum $1,378.16` EC2 42% etc. (`data/scenarios/balanced-startup.json:7`)
**E. Refs:** Hub `https://docs.aws.amazon.com/cost-management/latest/userguide/cost-optimization-hub.html`, Build in Amsterdam, Noomo.
**F. File Map:** `AGENTS.md` entry → `README.md`+`docs/01,03,15,20` before coding, ticket-by-ticket.

*End of TTD v2.0 — Build `✓` `a26e9ae` + `59a4950` merged to `main`, deployed `dpl_DCxamg...`*
