# NairaGuard Scrum Backlog

## Product Goal

Deliver a credible Demo-First FinOps application that demonstrates how NairaGuard can later connect to AWS without rewriting its core product.

## Epic 0 — Product foundation

### NG-001 — Project initialization
Acceptance:
- Next.js TypeScript app created
- lint/typecheck/build work
- documentation present
- environment strategy established

### NG-002 — Architecture skeleton
Acceptance:
- application/domain/infrastructure boundaries established
- provider interfaces documented
- no AWS SDK code in UI

### NG-003 — Design system foundation
Acceptance:
- black/white/orange tokens
- typography
- spacing
- responsive foundations

## Epic 1 — Authentication

### NG-101 — Authentication
Acceptance:
- sign up
- sign in
- sign out
- protected application routes

### NG-102 — Organization boundary
Acceptance:
- authenticated user maps to organization
- server-side authorization exists
- unauthorized data access is rejected

## Epic 2 — Demo provider

### NG-201 — Demo provider contract
Acceptance:
- provider interface defined
- demo implementation satisfies contract

### NG-202 — Demo scenarios
Acceptance:
- five scenarios
- scenario switching
- realistic synthetic data

### NG-203 — Demo synchronization
Acceptance:
- demo data can be loaded into application state/database
- sync timestamp exists

## Epic 3 — Cost intelligence

### NG-301 — Cost normalization
Acceptance:
- provider cost data normalized
- totals computed deterministically

### NG-302 — Cost dashboard
Acceptance:
- total USD
- NGN equivalent
- trend
- top services
- freshness

### NG-303 — Cost detail
Acceptance:
- service and regional breakdown
- filtering/time range

## Epic 4 — Optimization intelligence

### NG-401 — Recommendation normalization
Acceptance:
- recommendation schema
- source
- resource
- action
- savings
- effort/risk metadata

### NG-402 — Recommendation list
Acceptance:
- filter/sort
- savings display
- status

### NG-403 — Recommendation detail
Acceptance:
- evidence
- current/recommended configuration
- savings
- Naira impact
- action guidance

## Epic 5 — FX

### NG-501 — FX provider interface
Acceptance:
- demo and live adapters possible

### NG-502 — FX conversion
Acceptance:
- deterministic conversion
- cached rate
- timestamp/source

## Epic 6 — AI

### NG-601 — AI provider interface
Acceptance:
- mock AI provider
- structured schema

### NG-602 — Recommendation explanation
Acceptance:
- AI receives evidence
- AI cannot alter savings
- graceful failure

## Epic 7 — Homepage

### NG-701 — Marketing structure
Acceptance:
- product narrative
- CTA
- responsive layout

### NG-702 — Creative interactions
Acceptance:
- purposeful animations
- reduced-motion support
- no business logic dependency

## Epic 8 — Quality

### NG-801 — Unit tests
### NG-802 — Integration tests
### NG-803 — E2E tests
### NG-804 — Security review
### NG-805 — Performance review
### NG-806 — Production build/deployment

## Definition of Done

A ticket is not done because the page renders.

Done means:
- requirement implemented
- types pass
- lint passes
- tests pass where relevant
- error state considered
- authorization considered
- responsive behavior checked
- no unnecessary duplication
- documentation updated where architecture changed
