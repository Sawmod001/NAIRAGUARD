# NairaGuard — Product Requirements Document (PRD)
**Product:** NairaGuard — Naira-aware AWS FinOps Intelligence  
**Version:** 2.0 (Comprehensive) | **Date:** 2026-09-18 | **Status:** Production-Ready Demo-First  
**Owners:** Product + Engineering | **Stakeholders:** Founders, Engineers, Finance/Ops, Nigerian SMBs  
**Source Docs:** `01_PRODUCT_SPEC.md` → `24_TYPOGRAPHY_RESEARCH.md` + `02_DASHBOARD_DESIGN_SPEC.md` + `03_TECHNICAL_HARDENING_SPEC.md`  
**Deployment:** `https://nairaguard-ng.vercel.app` (Vercel Hobby + Neon Postgres) | **Repo:** `Sawmod001/NAIRAGUARD` main@59a4950

---

## Table of Contents
1. [Document Control](#1-document-control)
2. [Executive Summary](#2-executive-summary)
3. [Vision, Mission & Positioning](#3-vision-mission--positioning)
4. [Problem & Opportunity](#4-problem--opportunity)
5. [Goals, Non-Goals & Success Metrics](#5-goals-non-goals--success-metrics)
6. [Product Principles](#6-product-principles)
7. [Glossary & Financial Terminology](#7-glossary--financial-terminology)
8. [Users & Personas](#8-users--personas)
9. [Jobs-to-Be-Done & Core Questions](#9-jobs-to-be-done--core-questions)
10. [Product Pillars & Information Architecture](#10-product-pillars--information-architecture)
11. [Scope & Release Train](#11-scope--release-train)
12. [User Journeys & Flows](#12-user-journeys--flows)
13. [Information Architecture & Navigation](#13-information-architecture--navigation)
14. [Functional Requirements (Epics & Stories)](#14-functional-requirements-epics--stories)
15. [Feature Detail: SEE (Cost Intelligence)](#15-feature-detail-see-cost-intelligence)
16. [Feature Detail: FIND (Optimization Intelligence)](#16-feature-detail-find-optimization-intelligence)
17. [Feature Detail: UNDERSTAND (Explainability)](#17-feature-detail-understand-explainability)
18. [Feature Detail: PROTECT (Naira Context & FX)](#18-feature-detail-protect-naira-context--fx)
19. [Feature Detail: ACT (Decision Support)](#19-feature-detail-act-decision-support)
20. [Demo Data Specification](#20-demo-data-specification)
21. [Content Strategy & Copy System](#21-content-strategy--copy-system)
22. [Design System & UX Direction](#22-design-system--ux-direction)
23. [Non-Functional Requirements](#23-non-functional-requirements)
24. [Constraints & Assumptions](#24-constraints--assumptions)
25. [Risks & Mitigations](#25-risks--mitigations)
26. [Analytics & Instrumentation](#26-analytics--instrumentation)
27. [Open Questions & Decisions Log](#27-open-questions--decisions-log)
28. [Appendices](#28-appendices)

---

## 1. Document Control
| Field | Value |
|-------|-------|
| Author | NairaGuard Product Team |
| Version | 2.0 |
| Last Updated | 2026-09-18 |
| Status | Approved for Engineering |
| Related TTD | `docs/TTD.md` |
| Related Specs | `docs/01`–`24`, Hardening + Dashboard specs |
| Reviewers | Engineering, Design, Security |

**Change Log**
- 1.0 (2026-09-17) Lean PRD (8960 bytes)
- 2.0 (2026-09-18) Comprehensive standard — full personas, flows, epics, acceptance criteria, metrics, risks

---

## 2. Executive Summary
NairaGuard helps Nigerian startups and professionals understand AWS spending, identify credible cloud-waste, and translate potential savings into **estimated Naira impact**. Core sentence: *See where your AWS spend goes. Find the waste. Understand what it means in naira.*

**Current Mode:** Demo-First. No real AWS credentials required. Synthetic data behaves like real AWS Cost Explorer + Cost Optimization Hub + Compute Optimizer data. Live AWS Mode is a future provider swap, not a rewrite.

**One-liner Positioning:** `AWS FinOps, built with Naira in mind.` — Not a currency converter.

**MVP Promise:** Signed-in → choose Demo or Connect AWS → inspect spend → drivers → opportunities → recommendation detail (USD + NGN) → decide what to investigate. Read-only, no destructive actions (`01:75`).

---

## 3. Vision, Mission & Positioning
**Vision:** Every Nigerian team running on AWS can make cloud-financial decisions with the same confidence they make infrastructure decisions.
**Mission:** Turn opaque dollar-billed cloud usage into actionable Naira-aware decisions.
**Positioning Pillars:**
- Cloud-first (AWS concepts native, not generic expense tracking)
- Naira-aware (USD truth + NGN estimate with provenance)
- Evidence-led (source + timestamp + %)
- Engineering-minded (resource IDs, regions, effort/rollback visible)
- Explainable (AI explains, never invents)

**Message Hierarchy:** `See → Find → Understand → Act` (SEE/SAVE/PROTECT expanded to ACT for decision).

---

## 4. Problem & Opportunity
**Pain:** AWS bills arrive in USD; budgets are in NGN. Usage grows, idle resources linger, services over-provisioned, bill is surprise. Nigerian teams face double uncertainty: *how much cloud* + *what FX makes it mean*.
**Root Causes:** Spread across services/regions, waste invisible until investigated, pricing evidence hard to parse, FX movement changes budget meaning.
**Opportunity:** FinOps discipline + deterministic Naira translation + plain-language explainability = faster, safer optimization decisions. AWS already exposes Cost Explorer + Cost Optimization Hub aggregated recommendations (`01:53`) — NairaGuard makes them understandable in local financial context.

---

## 5. Goals, Non-Goals & Success Metrics

### 5.1 Goals (6 months)
- G1: Demo workflow feels like real FinOps workspace (not toy mock) — evaluated via founder blind test.
- G2: Time-to-insight <30s: from dashboard load to identifying top cost driver.
- G3: FX context comprehension: 90% of test users correctly explain NGN is estimate not bank charge.
- G4: Provider abstraction proven: Demo → Live swap via config, zero UI rewrite.

### 5.2 Non-Goals (MVP)
No auto-remediation, no long-lived AWS keys (IAM Role STS future), no multi-account org mgmt, no Slack/WhatsApp/email alerts, no advanced ML anomaly, no Terraform/K8s cost, no mobile app, no arbitrary service support, no enterprise reconciliation (`01:75`, `15:06`).

### 5.3 North Star & KPIs
North Star: `% of sessions where user reviews ≥1 recommendation detail`.
KPIs: Time to top driver, recommendation detail CTR, FX “How calculated” expand rate, onboarding completion, dashboard error rate `<1%`, `pnpm typecheck/lint/build/test` green.

### 5.4 OKRs (Example Q4)
- KR1: 80% of 10 pilot teams identify a rightsizing opportunity in Demo without guidance.
- KR2: FX disclaimer comprehension 90% (survey).
- KR3: Build `✓` on every main commit, Hardening spec 4/4 priority items shipped.

---

## 6. Product Principles (Non-Negotiable, `README:18`)
1. AWS/deterministic financial data is source of truth. 2. AI explains/summarizes, never invents savings. 3. NGN is estimate with timestamped rate `NGN = USD × rate`. 4. MVP read-only (no destructive AWS). 5. No destructive actions in MVP. 6. Every important number has source + freshness. 7. Demo data synthetic and clearly labeled `Demo Mode — synthetic AWS FinOps data`. 8. Tenant/account isolation server-enforced. 9. Business logic separated from UI. 10. Provider abstractions make Demo ↔ Live interchangeable.

**Hardening Addendum (03 spec §4):** bfcache `no-store` on app routes, server-side auth guard, session revocation, client state clear on sign-out; rate limiting `10/10m` auth + `100/min` general + `60/min` cost; tenant scoping at query layer; provider interface parity verified before UI expansion.

---

## 7. Glossary & Financial Terminology (`01:88`)
- **Actual cost:** Billing data from AWS.
- **Estimated monthly cost:** Provider estimate, not promise of future bill.
- **Estimated monthly savings / Potential savings:** `estimatedMonthlySavingsUsd` from Hub/Optimizer; realized only after implementation and future usage (`01:97`).
- **Realized savings:** Observed after optimization — future.
- **Estimated Naira equivalent:** `USD × USD/NGN rate`, never bank charge (`01:108`).
- **Cost driver:** Service/region/resource category driving meaningful spend.
- **Savings opportunity:** Credible finding with estimated savings.
- **FinOps:** Engineering+Finance+Ops discipline for cloud value.
- **Recommendation fields required:** `source, resource, current→recommended config/action, estimated monthly cost, estimated monthly savings, savings %, effort, restartRequired, rollbackPossible, region, timestamp` (`01:139`).

---

## 8. Users & Personas

### 8.1 Primary MVP Users (`01:11`)
Founders, technical founders, engineers responsible for infra, small eng teams (2-8), technical/product pros managing AWS costs. Nigerian SMBs budgeting in NGN, paying in USD.

### 8.2 Personas
**P1 — Tola, Seed Founder (Non-Technical):** Needs to answer board: “Why did AWS jump 30%? What does ₦ mean? What to do next?” Pain: bill shock, no engineer to explain. JTBD: `When FX moves, I want to see NGN impact so I can adjust runway`.
**P2 — Emeka, Platform Engineer:** Manages EC2/RDS/EBS. Needs resource-level evidence, CPU lookback, effort/restart to plan sprint. JTBD: `When I see a rightsizing rec, I want evidence + rollback so I can validate safely`.
**P3 — Aisha, Finance/Ops:** Prepares monthly report, needs exportable totals + NGN estimate with provenance for CFO. JTBD: `When I report, I want rate/timestamp/source so finance trusts the number`.
**P4 — Chidi, Evaluator (Future Buyer):** Judges if product is serious vs toy. Needs traceable recommendations, not LLM hallucinations.

### 8.3 Segmentation
Early: Nigerian startups $500–$5k/mo AWS, 1 workspace, 1 AWS account, Demo-first.

---

## 9. Jobs-to-Be-Done & Core Questions
**Core Questions (`01:23`):** How much? What services most? Where waste? How much could save? What in NGN? What to do next? How reliable?
**Critical UX Principle:** For every metric/chart/table ask `Would a non-expert understand?` If not, add concise context: short description, tooltip, `What this means / Why it matters / How calculated`, evidence panel (`Production Prompt §2`). Progressive disclosure, not paragraphs.

**Mental Model:** SEE (How much? Trend? Drivers?), FIND (Where waste? Idle? Rightsize?), UNDERSTAND (Why? Evidence? Effort? Risk? NGN?), ACT (What first? Who reviews? Expected impact?).

---

## 10. Product Pillars & Information Architecture
Pillars map to nav:
- **SEE →** Costs, Dashboard overview
- **FIND →** Optimizations list
- **UNDERSTAND →** Recommendation detail + AI explanation
- **ACT →** Activity (what happened), Connections (is AWS connected?), Settings (who am I).
- **PROTECT →** Cross-cutting: every USD has NGN + rate/timestamp/source.

**Trust Layer:** Provider evidence → Deterministic calculations → AI explanation (never reverse, `07:03`).

---

## 11. Scope & Release Train (`15_SCRUM_BACKLOG.md`, `16_IMPLEMENTATION_SEQUENCE.md`)

### 11.1 Epics & Tickets
- **Epic 0 Foundation:** NG-001 init (Next.js TS, lint/typecheck/build), NG-002 skeleton (app/domain/infra boundaries, provider interfaces, no SDK in UI), NG-003 tokens (black/white/orange `#E8622C`)
- **Epic 1 Auth:** NG-101 sign-up/in/out + protected routes, NG-102 org boundary (server authz)
- **Epic 2 Demo:** NG-201 contract, NG-202 5 scenarios + switching, NG-203 sync + timestamp
- **Epic 3 Cost:** NG-301 normalization, NG-302 dashboard (USD, NGN, trend, top services, freshness), NG-303 detail (service/region, filtering, 7/30/90D)
- **Epic 4 Optimization:** NG-401 schema, NG-402 list (filter/sort/status), NG-403 detail (evidence, configs, savings, NGN, guidance)
- **Epic 5 FX:** NG-501 interface, NG-502 deterministic conversion + cached rate + provenance
- **Epic 6 AI:** NG-601 interface + mock, NG-602 explanation (evidence in, savings immutable, graceful failure)
- **Epic 7 Homepage:** NG-701 narrative, NG-702 purposeful animations + reduced-motion
- **Epic 8 Quality:** NG-801 unit, NG-802 integration, NG-803 E2E (Playwright), NG-804 security, NG-805 perf, NG-806 build/deploy

### 11.2 Phased Sequence (`16:03`)
Skeleton → Domain contracts → Demo data → DB → App services (dashboard/breakdown/recommendations/FX/AI) → UI (shell → dashboard → costs → optimizations → detail → settings) → AI → Homepage → Testing → Live AWS adapter (Cost Explorer + Hub + Compute Optimizer).

### 11.3 What MVP Does NOT Do
Listed in §3.2 + no homepage rewrite during harden (Dashboard spec out-of-scope for homepage).

---

## 12. User Journeys & Flows

### 12.1 Flow A — Landing
Visitor → Homepage (problem → See/Find/Understand → How it Works → Demo → Trust → CTA) → Sign up / Sign in. Homepage must not look like generic SaaS (`13_UI_UX:39`).

### 12.2 Flow B — Sign Up / First-Run
Sign-up (Zod, bcrypt12, dormant email verification) → auto-create personal Organization + Membership owner → **Onboarding** (hardening §4): 
- *Existing configured workspace* (has org + membership + demo/Live choice) → Dashboard
- *New user* (just created) → Onboarding interstitial: `Welcome to NairaGuard` → choice **Explore Demo** (`/dashboard?scenario=balanced-startup`) vs **Connect AWS** (IAM Role STS explainer, disabled “coming soon”). Must not stare at empty dashboard. Middleware `src/proxy.ts` server-enforced + org existence check in `src/app/(app)/layout.tsx` (ActivityEvent count 0 → redirect to onboarding unless dismissed).

### 12.3 Flow C — Demo Onboarding
Sign in → Choose Demo Mode → pick scenario (Balanced, Waste-Heavy, EC2-Heavy, Storage-Heavy, FX Pressure, Growth) → dashboard changes total, trend, distribution, opportunities, NGN, activity deterministically. Totals reconcile (`06:63`).

### 12.4 Flow D — Dashboard (Production Prompt §8-18)
Inspect total spend (`$1,378.16 30d`) → NGN `₦2,136,148 at ₦1,550 2026-09-15` → savings `$138.70/mo` → opportunities 2 (low effort) → trend (7/30/90D pill, y-axis gridlines, accent hover tooltip) → service distribution (horizontal bar `42%` visible) → What Needs Attention (EC2 `$118.70 Low effort Validate workload → Review`) → Recent Activity (Cost refreshed 2h ago, Optimization identified, FX recorded) → What This Means (concentrated in EC2+RDS 60%, largest rec, NGN) — all with `What this means / How calculated` disclosures.

### 12.5 Flow E — Recommendation
List → detail: resource `i-0demo001 eu-west-1`, current `m6i.2xlarge` → recommended `m6i.xlarge`, `Current $286.40 / Savings $118.70 41.4% / NGN ₦183,985`, evidence CPU 12.4% 14d, effort Low, restart Yes, rollback Yes, source Hub, freshness, AI explanation (not altering $), next step `Validate → schedule → monitor`.

### 12.6 Flow F — Future Live AWS
Connect AWS → IAM Role + STS + external ID least-privilege → verification → sync (batched, cached, not per-render) → same dashboard/domain engine. Must handle `AWS_ACCESS_DENIED / THROTTLED / NO_DATA / NOT_READY` (`17:36`).

### 12.7 Empty/Error Flows (`02:43`)
- No cost data → `No spend recorded yet for this period` + action Connect/Explore Demo
- No recommendations → `No optimization opportunities yet… when Hub receives data they appear` (not `NG-406` ticket noise)
- AWS denied/throttled/unavailable → `We couldn't refresh… previous data still available. Check connection` + CTA
- FX/AI unavailable → stale warning or `AI explanation unavailable` non-blocking, deterministic savings still visible
- DB unavailable, invalid org access → server authz rejection

---

## 13. Information Architecture & Navigation

### 13.1 Routes (`04_ROUTES_AND_PAGES.md`)
- `/` Marketing (editorial, cinematic)
- `/sign-in`, `/sign-up`, `/privacy`, `/terms`
- `/onboarding` (first-run)
- `/dashboard` overview (SEE + FIND + UNDERSTAND summary)
- `/costs` + `/costs/[service]` + `/costs/resource/[id]` analytical drill
- `/optimizations` (workspace table) + `/optimizations/[id]` detail
- `/activity` (audit timeline), `/connections` (AWS vs Demo), `/settings` (profile/workspace/preferences/security)
- Future: `/aws/connect, /budgets, /alerts` (leave room)

### 13.2 Navigation Rule
Keep MVP small: `Dashboard | Costs | Optimizations | Settings` top-level; App shell groups `OVERVIEW (Dashboard) | FINOPS (Costs, Optimizations, Activity) | ACCOUNT (Connections, Settings)` bottom Demo indicator + Sign out. Every item must have real purpose (`04:107`).

### 13.3 Homepage Narrative (`22_HOMEPAGE_CONTENT.md`, `23_HOMEPAGE_DESIGN_SYSTEM.md`)
10 sections: Hero (What is NairaGuard, `Explore Demo`/`See how it works`, visual story `AWS resources → spend → waste → savings → ₦`), Problem (`Your infra runs in AWS. Your business runs in naira.`), SEE (current/trend/top services), FIND (rightsizing example `$286.40 → $118.70 Low Restart Yes 41.4%`), UNDERSTAND (NGN translation), How it Works (Connect/Normalize/Calculate/Explain, `AI explains numbers not invent`), Recommendation showcase, Demo (5 scenarios), Technical Credibility (provider evidence/deterministic/explainable/security), Why NairaGuard, Final CTA.

---

## 14. Functional Requirements (Epics & Stories)

### 14.1 Epic 0 — Foundation
- **NG-001:** Next.js TypeScript strict, Prisma, lint/typecheck/build green, `.env.example` safe.
- **NG-002:** Boundaries `presentation|application|domain|infrastructure`, provider interfaces documented, no SDK in UI.
- **NG-003:** Tokens black/white/orange `#E8622C` → aligned to Design Spec `#0E0E0F/#FAFAF9/#E8622C`.

### 14.2 Epic 1 — Auth
- **NG-101:** `signUp {email, password>=8 + uppercase+number, confirm, name optional}` Zod, bcrypt12, idempotent org creation; `signIn` credentials + JWT httpOnly Secure SameSite Lax CSRF; `signOut` server invalidates + client clears `sessionStorage/localStorage/caches`; protected routes via `src/proxy.ts` middleware.
- **NG-102:** Every read/write `where: {organizationId}` from membership, never trust client orgId, 401/403 on mismatch.

### 14.3 Epic 2 — Demo
- **NG-201:** Interfaces `CostProvider, OptimizationProvider, ResourceProvider, FXProvider, AIProvider` TS.
- **NG-202:** 5 scenarios + Growth, deterministic, switching via `?scenario=` preserves across drill.
- **NG-203:** Sync timestamp `observedAt` ISO, freshness displayed.

### 14.4 Epic 3 — Cost
- **NG-301:** Normalization `Provider CostResult → DomainCost {currency USD, total, daily[], services[], regions[], observedAt, source}` totals computed deterministically, percentages `amount/total*100`.
- **NG-302:** Dashboard: total USD, NGN via `toNairaEquivalent`, trend, top services, freshness, previous-period delta.
- **NG-303:** Costs page: service/region breakdown, 7/30/90D period, trend, comparison, horizontally scrollable table on narrow.

### 14.5 Epic 4 — Optimization
- **NG-401:** Schema `source, externalId, resourceId, resourceType, actionType, region, current→recommended, estimatedMonthlyCostUsd, estimatedMonthlySavingsUsd, savingsPercentage, effort, restartRequired, rollbackPossible, status, observedAt`.
- **NG-402:** List: filter service/region/effort/status, sort savings/%/effort, savings display, status, accent on high savings; empty `No optimization yet…`.
- **NG-403:** Detail: evidence (CPU 12.4% 14d), configs, savings, NGN, risk/effort, evidence, AI explanation, action guidance.

### 14.6 Epic 5 — FX
- **NG-501:** Interface `FXProvider.getRate()`, Demo fixture `data/fx/demo-rates.json`, Live fun/currencyapi.
- **NG-502:** `convertUsdToNgn` deterministic `Math.round(USD*rate*100)/100`, cached `provider/rate/observedAt/expiresAt`, fallback cached→last-known stale→do not fabricate, display `Estimated equivalent — not exact bank charge`.

### 14.7 Epic 6 — AI
- **NG-601:** Interface `AIProvider.explain` mock deterministic, Zod schema, structured output.
- **NG-602:** Explanation receives evidence, cannot alter savings, graceful `AI explanation unavailable` with retry, priority/confidence/assumptions.

### 14.8 Epic 7 — Homepage
- **NG-701:** Product narrative per §22, CTA `Try Demo`/`Sign in`.
- **NG-702:** Purposeful animations (GSAP timeline hero, ScrollTrigger pinned sections), reduced-motion support, no business logic dependency.

### 14.9 Epic 8 — Quality
- **NG-801-803:** Vitest unit (conversion, prioritization), provider contract (Mock vs AWS shape), Playwright E2E (signup→dashboard→scenario→costs→optimizations→detail→NGN→empty→401), **NG-804-806** security/perf/prod build.

**Acceptance Criteria Example (Gherkin):**
```gherkin
Given new user signs up with valid email/password
When they land after creation
Then they see onboarding with Explore Demo and Connect AWS choices
And not an empty dashboard

Given Demo Balanced Startup selected
When dashboard loads
Then total spend $1,378.16 ±0.01 reconciles to sum of service breakdown percentages ≈100%
And NGN = USD × 1,550 from 2026-09-15

Given user presses Back after sign-out
Then they are redirected to /sign-in immediately
And no flash of dashboard content
And reloading /dashboard also redirects (no-store headers)
```

---

## 15. Feature Detail: SEE (Cost Intelligence)
- **Cost Normalization:** Provider daily/service/region → `DomainCost` via `normalizeCostResult`. Totals `sum(daily.amount)`. Percentages validated `sum ≈100% ±0.5%` due to rounding.
- **Dashboard Summary:** `$1,378.16 30d EC2 42%` etc.
- **Trend:** Line/bar with y-axis 3 gridlines + `$` ticks, hover tooltip exact date+amount, 7/30/90D pill (filled accent), previous-period comparison inline `↑ +4.2%`.
- **Distribution:** Table `Service | Spend | Share | Bar` with horizontal bar proportional, capped 5 rows + `Show all`, click → service detail.
- **Freshness:** `Last synced 2 min ago` top bar, per-card `Freshness 2026-09-15`.

## 16. Feature Detail: FIND (Optimization Intelligence)
- **Sources:** Hub aggregates deduplicates (`07:27`), Compute Optimizer per-resource utilization.
- **Priority Formula (conceptual):** `savings 50% + effort 20% (Low 0, Med 1, High 2) + performance risk + restart + rollback + confidence` (`07:45`).
- **Table vs Cards Rule:** Tables for relational (resources, costs, recs, activity), cards for summary/insight (`Production §25`). Desktop table, mobile stacked records with horizontal scroll.

## 17. Feature Detail: UNDERSTAND (Explainability)
Every metric has `What this means` (one-line plain), `Why it matters`, `How calculated`. Progressive disclosure via `details/summary` or tooltip, not paragraphs. Teach without verbosity.

## 18. Feature Detail: PROTECT (Naira Context & FX)
Spec `09_FX_SPEC.md`: `USDNGN only MVP`, `Rate provenance` `provider/rate/observedAt/expiresAt`, `Never show Your bill is ₦4.2M` → `Estimated Naira equivalent: ₦4,200,000 at ₦1,550/USD (demo-fixture 2026-09-15)`. Hardening: FX freshness dot `FX updated 2d ago` persistent badge near NGN.

## 19. Feature Detail: ACT (Decision Support)
Dashboard attention layer `What needs attention` with `Why (underutilized), Effort Low, Risk Validate workload, Rollback Yes, Source, CTAs Review/Accept/Dismiss (Accept/Dismiss are demo status updates, not AWS)`.

## 20. Demo Data Specification (`06_DEMO_DATA_SPEC.md`)
Layers: Account metadata (synthetic ID `999977463648`, regions), 90d cost, service breakdown 8 services, recommendations (2 in Balanced, 3 in Waste-Heavy, EC2-Heavy, etc.), resource ARNs, FX history, AI analysis. Realism: low/med/high effort mixed, different regions `eu-west-1/us-east-1`, zero-savings case, one scenario with no recommendations, one with provider error simulation. Label `Demo environment Synthetic AWS data`.

## 21. Content Strategy & Copy System (`22_HOMEPAGE_CONTENT.md`)
Microcopy rules: Prefer `See spend / Find waste / Review opportunity / Estimated monthly savings / Estimated Naira equivalent / View evidence / Investigate recommendation / Data refreshed` vs avoid `Unlock future / Transform / Intelligent insights / Supercharge`. Technical credibility visible but not dominant. Currency: `Estimated monthly savings` not `Potential savings` generic. All CTA labels action-specific `Explore Demo, Inspect an opportunity, View recommendation details`.

## 22. Design System & UX Direction (`13_UI_UX, 23_HOMEPAGE_DESIGN_SYSTEM, 24_TYPOGRAPHY`)
- **Intent:** `Controlled editorial + experimental brutalism selectively`. Not generic SaaS: no repetitive rounded cards, no purple/blue gradients, no glassmorphism.
- **Color:** Light `Black #0E0E0F / White #FFFFFF / Orange #E8622C` (accent attention, not background everywhere), Dark `ink #0E0E0F + muted #6B6B6E` sidebar, red `#C4432E` only for destructive. Dashboard uses updated spec tokens (previously `#0a0a0a/#fafaf8/#ff3b30` migrated to `#0E0E0F/#FAFAF9/#E8622C`).
- **Typography:** `Clash Display (hero/display 400,600,700) + Satoshi (UI/body 400,500,700) + JetBrains Mono (technical IDs)` via Fontshare `https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&f[]=satoshi@400,500,700`. Experimental accents `Array/Stardom/Gambarino/Boska` sparingly. Test strings `See where your AWS spend goes. / ₦1,842,500 / $1,187.40 / 41.4%` (`24:211`).
- **Layout:** `border-box` baseline, `flex` for 1D, `grid` for 2D, `sticky` for storytelling. 12-col 24px gutter, spacing scale `4/8/12/16/24/32/48/64/80/96/128/160` (`23:207`), radius varied (not one radius everywhere), flat border-driven shadows.
- **Dashboard Redesign Tokens (`02:2`):** `--ink #0E0E0F, --paper #FAFAF9, --panel #FFFFFF, --line #E7E5E2, --accent #E8622C, --accent-dim #FCEBE3, --ink-muted #6B6B6E`. Panel treatment uniform: `8px radius, 1px --line, 20-24px pad`; hierarchy via position/size, not decoration. KPI value `28-32px semibold` tabular-nums.
- **Motion:** Marketing uses GSAP timeline + ScrollTrigger selectively, pinned explanatory sections, product UI transformation; App uses 150-250ms micro, 250-450ms UI, 500-800ms major, respects `prefers-reduced-motion`.

## 23. Non-Functional Requirements

### 23.1 Security (`10_SECURITY.md` + Hardening)
- Auth: `Auth.js v5 Prisma Postgres httpOnly secure cookie, bcrypt12, CSRF, trustHost`.
- Authz: every read/write `where: {organizationId}` from `prisma.membership.findFirst({where:{userId}})`, never trust browser orgId.
- Live future: IAM Role + STS + external ID, no long-lived keys, least privilege.
- Headers: `Cache-Control: no-store, must-revalidate` on app routes (bfcache fix), `Pragma: no-cache, Expires: 0`.
- Rate limiting: `src/lib/rate-limit.ts` sliding-window in-memory (Redis future) `auth 10/10m per IP+path → 429 Retry-After` + `api 100/min per user` + `cost 60/min` scrap protection.
- Validation: `signUpSchema`, `dashboardQuerySchema` Zod at API boundary before query.
- Logging: event+orgId+correlationId, never credentials/PII/account IDs.
- Error boundaries: per dashboard panel `PanelErrorBoundary`.

### 23.2 Performance & Accessibility
- Load: lazy non-critical images, responsive images, code-split, limit GSAP instances, cleanup ScrollTrigger, no `use client` everywhere.
- A11y: semantic HTML, keyboard nav, `focus-visible: 2px solid #E8622C`, contrast, reduced-motion, screen readers, accessible tables (headers, scope), chart `role=img aria-label`.
- Responsive: desktop full sidebar 260px, tablet compressed nav, mobile drawer + stacked metrics + scrollable tables (`23:148`).

### 23.3 Data Quality
- `pnpm typecheck/lint/test/build` green on every main commit (`15:158`).

## 24. Constraints & Assumptions
- Demo data must be deterministic enough for tests (`20:76`), not random per render.
- AWS data delayed (`17:24`), Compute Optimizer needs history, so UI must handle empty/no-recommendations gracefully.
- FX rate free providers terms rechecked before prod (`09:21`).
- Typography license verified before prod (`24:40`).

## 25. Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users confuse NGN estimate as bank charge | High | High | Persistent `Estimated equivalent` + `How calculated` disclosure + freshness dot |
| Bfcache shows dashboard after sign-out | Medium | High | `no-store` headers + server guard + client clear (Hardening #1) |
| Over-optimistic savings summed blindly | Medium | High | Preserve Hub deduplication semantics, show per-rec savings, not inflated total |
| Demo feels fake (toy mock) | High | Medium | 7 layers realistic data, totals reconcile, scenario switching without architecture change |
| Cost Explorer throttling when Live | Medium | Medium | Cache/batch/schedule retrieval, rate limit cost reads 60/min |
| Single-process rate limit bypass on scale | Low | Medium | Redis store when multi-instance |

## 26. Analytics & Instrumentation
Events: `sign_up, sign_in, onboarding_choice {demo|aws}, scenario_switch, dashboard_view, costs_view, optimization_filter, recommendation_open, ai_explain_viewed, fx_how_calculated_expand`. Funnel: Landing → Onboarding → Dashboard → Recommendation detail. Dashboard KPIs instrumented via domain functions unit-testable.

## 27. Open Questions & Decisions Log
- Q: Exact production FX provider? A: Defer to before launch, keep adapter pluggable (`21:28`).
- Q: Chart library? A: Deferred, keep simple div bars + client tooltip for MVP, replace with `recharts/visx` later without domain change.
- Q: Homepage animation final? A: Deferred, keep `border-box` baseline, add GSAP later.
- Decisions: ADR-001 Demo First, 002 Provider interfaces, 003 Prisma Pg, 004 Auth.js over Clerk, 005 AI not authority, 006 Read-only, 007 Creative homepage vs calm dashboard (`19_DECISIONS.md`).

## 28. Appendices
- **A. Route Map:** `src/app/page.tsx` HeroNew → Problem → See → Find → Understand → HowItWorks → Recommendation → Demo → Credibility → Why → FinalCTA → Footer; App shell children via `src/app/(app)/layout.tsx`.
- **B. Sequence:** Sign-up `form.tsx → signUp server action (Zod+bcrypt+tx User+Org+Membership) → signIn credentials → jwt callback → session → redirect`.
- **C. Demo Scenario Totals:** Balanced `$1,378.16` (EC2 42% $578.83, RDS 18%, EBS 12%...) `data/scenarios/balanced-startup.json:7`.
- **D. FinOps Math Example:** `$118.70 savings → ₦183,985 at 1550` (`07:13`).
- **E. References:** Cost Optimization Hub `https://docs.aws.amazon.com/cost-management/latest/userguide/cost-optimization-hub.html`, Build in Amsterdam, Noomo.

*End of PRD v2.0*
