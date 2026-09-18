# NairaGuard — MVP vs Later

## MVP now
### 1. AWS cost visibility
Service, region, period and trend analysis.

### 2. Optimization intelligence
Evidence-backed opportunities from supported AWS data.

### 3. Naira context
Recorded FX conversion and transparent NGN estimates.

### 4. AI / LLM
Grounded explanations and follow-up questions.

### 5. Production-grade demo
Synthetic but realistic data using the same normalized model.

### 6. Security and account isolation
Auth.js, secure sessions, authorization, AWS role-based access architecture.

## Later — explicitly paused
### Scaling intelligence
Possible future feature:
- estimate cost implications of growth
- compare scaling approaches
- model capacity scenarios
- explain financial impact

This is NOT MVP.

## Other possible future roadmap
- forecasting
- budgets/alerts
- commitments/discounts
- unit economics
- broader technology spend
- multi-cloud
- approved automated remediation
- governance workflows

Do not implement these until the core MVP is stable and validated.

## NairaGuard — Scrum Tickets

## Sprint 0 — Product & repository audit

### NG-001 — Full repository audit
**Goal:** Understand the existing application before modifying architecture.

Tasks:
- inspect current routes/components/lib/database/auth
- identify Clerk implementation
- identify existing Neon/Prisma setup
- identify demo implementation
- identify current homepage components
- identify existing chart/UI libraries
- identify dead/duplicate code
- identify conflicting documentation
- produce a short audit report

Acceptance:
- no major architecture change before audit
- current implementation mapped

### NG-002 — Product boundary cleanup
Remove references/features for:
- learning
- upskilling
- courses
- AWS Bedrock
- scaling/growth in MVP

Acceptance:
- docs and UI no longer present these as MVP features

---

## Sprint 1 — Authentication

### NG-101 — Remove Clerk completely
Tasks:
- remove Clerk dependencies
- remove Clerk middleware/provider/components
- remove Clerk env references
- remove Clerk-specific helpers
- remove Clerk configuration/docs
- remove stale generated artifacts
- search repository for Clerk references
- ensure no Clerk code remains

Git:
- commit removal on branch
- push branch
- merge only after review

### NG-102 — Implement Auth.js
Use Auth.js with secure cookie sessions.

Tasks:
- choose supported credentials/provider strategy based on current requirements
- configure server-side auth
- protect application routes
- implement sign in/sign up as required
- implement sign out
- implement session retrieval
- ensure unauthorized users cannot access protected data
- integrate with Prisma/Neon
- avoid business logic depending directly on Auth.js internals

Acceptance:
- secure session cookie
- authenticated dashboard
- protected server operations
- sign out invalidates session
- no Clerk references

---

## Sprint 2 — Database/domain foundation

### NG-201 — Prisma/Neon domain schema
Implement production-oriented schema for:
- users/auth
- AWS connection
- cost snapshots
- cost breakdowns
- optimization opportunities
- evidence
- FX rates
- AI conversation
- demo scenarios
- audit events

Acceptance:
- migrations work
- indexes/constraints exist
- tenant boundaries are explicit

### NG-202 — Domain calculation services
Implement deterministic:
- totals
- percentages
- aggregation
- USD/NGN conversion
- savings calculations
- period comparisons

Acceptance:
- no LLM performs authoritative calculations
- unit tests cover edge cases

---

## Sprint 3 — Demo parity

### NG-301 — Production-grade demo dataset
Create controlled scenarios:
- Balanced Startup
- Waste-heavy
- EC2-heavy
- FX Pressure

Acceptance:
- internally consistent
- deterministic
- clearly labelled
- same domain model as live integration

### NG-302 — Demo adapter
Create a provider-style demo adapter feeding the same domain services used by AWS.

Acceptance:
- swapping Demo adapter for AWS adapter does not require rewriting dashboard logic

---

## Sprint 4 — AWS integration foundation

### NG-401 — AWS provider interface
Define the internal AWS provider contract.

### NG-402 — Cost data integration
Implement server-side Cost Explorer integration after validating current AWS API requirements/pricing.

### NG-403 — Optimization data integration
Integrate supported AWS optimization recommendation sources where permitted.

### NG-404 — STS/IAM role integration
Implement temporary role-assumption architecture and least-privilege checks.

Acceptance for AWS tickets:
- no browser-held AWS secrets
- clear permission errors
- source/freshness recorded
- tenant isolation

---

## Sprint 5 — FX

### NG-501 — FX provider abstraction
Choose a reliable free/low-cost provider suitable for MVP after current research.

### NG-502 — FX normalization
Store rate + timestamp + source.
Expose rate used for every NGN calculation.

Acceptance:
- provider failure does not destroy USD truth
- stale/missing FX is visible

---

## Sprint 6 — AI

### NG-601 — AI provider abstraction
Research current providers and choose one based on:
- structured output
- tool calling
- latency
- free/low-cost availability
- rate limits
- privacy/data policy
- reliability
- SDK quality

### NG-602 — Grounded analysis context
Build structured evidence context.

### NG-603 — AI explanation
Implement evidence-grounded explanations.

### NG-604 — Follow-up conversation
Allow users to ask questions about authorized findings.

Acceptance:
- AI cannot fabricate financial facts
- AI failure does not break dashboard
- outputs are validated
- conversation is scoped to authorized data

---

## Sprint 7 — Dashboard

### NG-701 — Information architecture redesign
Reduce generic card-grid appearance.

### NG-702 — Recharts analytics
Implement useful charts:
- spend trend
- service breakdown
- region breakdown
- savings opportunity
- comparison

### NG-703 — shadcn component system
Standardize controls, tables, dialogs, tabs, tooltips, alerts and states.

### NG-704 — Empty/loading/error states
Design real product states.

---

## Sprint 8 — Creative homepage

### NG-801 — Homepage audit/art direction
Do not code first.
Audit existing homepage and supplied imagery.

### NG-802 — Design tokens
Implement color, typography, spacing, radius, border, z-index and motion tokens.

### NG-803 — Typography
Integrate approved fonts correctly.

### NG-804 — Hero choreography
Use GSAP timeline and selected typography/image reveals.

### NG-805 — Scroll storytelling
Implement only the sections where scroll behavior communicates meaning.

### NG-806 — Image storytelling
Use the two supplied business images intentionally; avoid decorative slideshow behavior.

### NG-807 — Responsive art direction
Desktop/tablet/mobile should have deliberate compositions.

### NG-808 — Accessibility/performance pass
Reduced motion, keyboard, image optimization, animation cleanup.

---

## Sprint 9 — Security/production hardening

### NG-901 — Authorization audit
Test tenant boundaries.

### NG-902 — Secrets/configuration audit
Verify no secrets reach client.

### NG-903 — AWS permission/error handling
Test denied, expired and throttled scenarios.

### NG-904 — Security headers/rate limiting
Implement appropriate protections.

### NG-905 — Audit events/observability
Implement safe structured operational events.

---

## Sprint 10 — Release readiness

### NG-1001 — Critical Playwright suite
### NG-1002 — Domain calculation tests
### NG-1003 — Production build
### NG-1004 — Environment/configuration documentation
### NG-1005 — Final UX/accessibility/performance audit
### NG-1006 — Branch review and merge

## Definition of Done
A ticket is complete only when:
- implementation is maintainable
- acceptance criteria pass
- no unrelated scope creep
- security implications are handled
- documentation is updated when needed
- changes are committed to the working branch
- branch is pushed
- merge to main happens only after review

Do not silently expand MVP scope.

## NairaGuard — AI Coding Agent Operating Rules

## Before coding
1. Read all numbered specification files.
2. Inspect the repository.
3. Inspect existing implementation before replacing anything.
4. Identify dependencies and existing architecture.
5. State the ticket being worked on.
6. Do not modify unrelated areas.

## Architecture discipline
- Do not add a library unless there is a clear reason.
- Do not replace Neon just to introduce another database.
- Use Prisma.
- Keep external providers behind adapters.
- Keep domain calculations deterministic.
- Keep secrets server-side.
- Keep auth and authorization separate from business logic.

## Auth migration
Clerk is being removed.
Auth.js is the target.
Do not leave compatibility code that keeps Clerk alive "just in case."

## Homepage discipline
The homepage should be intentionally designed, not generated from a generic SaaS template.

Before implementation:
- inspect supplied screenshots/assets
- audit current sections
- determine what content is necessary
- remove weak/repetitive copy
- establish information hierarchy
- choose a visual narrative

Do not:
- add random gradients
- use excessive cards
- use the same rounded rectangle everywhere
- animate everything
- add a custom cursor unless it genuinely improves the experience
- add WebGL simply to appear advanced

## Content
The homepage should communicate:
1. what NairaGuard is
2. the problem
3. the core workflow
4. why Naira context matters
5. what users can inspect
6. what the demo proves
7. a clear CTA

Do not overwhelm the homepage with implementation details.

## AI
AI explanations must cite or reference available evidence internally.
Never let the model determine authoritative money values.

## AWS
Never ask users to paste permanent access keys into the browser.
Prefer IAM role + STS temporary credentials.

## Demo
Demo must be credible and deterministic.
Never label synthetic data as live AWS data.

## Testing
Do not repeatedly run the full suite for trivial visual changes.
Use meaningful checkpoints.

## Git
Work on a branch.
Commit coherent units.
Push branch.
Merge to main after review.

## Stop conditions
Pause and raise an issue before coding if:
- a requested feature conflicts with the product definition
- an external API requirement is unclear
- security could be compromised
- a requested feature would require major architecture change
- a calculation cannot be made deterministically
