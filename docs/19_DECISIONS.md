# Architecture Decision Record

## ADR-001 — Demo First

Decision:
Build Demo Mode before Live AWS Mode.

Reason:
- no personal AWS billing dependency
- faster development
- deterministic testing
- portfolio-ready product
- same domain contracts can later support AWS

## ADR-002 — Provider Interfaces

Decision:
Use provider interfaces.

Reason:
Prevents AWS SDK coupling throughout the application.

## ADR-003 — Prisma + PostgreSQL

Decision:
Use Prisma with PostgreSQL.

Reason:
- relational data fits the product
- strong type safety
- migrations
- filtering/aggregation
- future multi-tenant growth

Prisma provides an established Next.js/PostgreSQL integration path. citeturn0search2turn0search12

## ADR-004 — Clerk Authentication

Decision:
Use Clerk for MVP authentication.

Reason:
Avoid building authentication infrastructure while keeping the product secure.

## ADR-005 — AI is not financial authority

Decision:
AI does not calculate canonical savings.

Reason:
LLMs can hallucinate. Provider evidence and deterministic calculations must remain authoritative.

## ADR-006 — Read-only MVP

Decision:
No AWS mutation.

Reason:
Security and product scope.

## ADR-007 — Creative homepage, conservative dashboard

Decision:
Homepage can use advanced motion/visual techniques; application pages prioritize clarity.

Reason:
Marketing and operational UX have different jobs.
