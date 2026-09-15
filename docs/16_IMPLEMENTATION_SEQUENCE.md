# Implementation Sequence

## Phase 1 — Skeleton

Do not start with the homepage animation.

First establish:
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- authentication
- lint/typecheck
- project structure
- environment handling

## Phase 2 — Domain contracts

Define:
- cost domain
- recommendation domain
- FX domain
- provider interfaces
- errors
- validation schemas

No AWS dependency yet.

## Phase 3 — Demo data

Create:
- scenarios
- provider fixtures
- realistic relationships
- scenario loader
- deterministic tests

## Phase 4 — Database

Implement Prisma models and migrations.

Seed demo data.

## Phase 5 — Application services

Implement:
- get dashboard summary
- get cost breakdown
- get recommendations
- get recommendation detail
- convert USD → NGN
- generate AI explanation

## Phase 6 — Application UI

Build in this order:

1. application shell
2. dashboard
3. costs
4. optimizations
5. recommendation detail
6. settings

## Phase 7 — AI

Only after deterministic recommendation data works.

## Phase 8 — Homepage

Now build the creative marketing experience.

This avoids spending days polishing a frontend while the product logic is unstable.

## Phase 9 — Testing

Run:
- unit
- integration
- provider contract
- E2E
- authorization
- failure scenarios

## Phase 10 — Live AWS adapter

Only after Demo Mode is stable.

The AWS adapter should consume the same domain contracts.

AWS Cost Optimization Hub and Compute Optimizer are the primary future recommendation sources because they already provide AWS-native optimization findings and estimated savings. citeturn0search0turn0search3
