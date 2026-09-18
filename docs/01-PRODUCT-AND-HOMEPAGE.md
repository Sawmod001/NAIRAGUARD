# NairaGuard — Production Build Specification

## Purpose
This folder is the source of truth for the AI coding tool. Read the files in numerical order before changing code.

NairaGuard is a cloud financial intelligence and AWS FinOps application designed to help businesses understand AWS spend, identify optimization opportunities, and express USD costs/savings in Naira context.

## Current product boundary
- MVP is AWS-focused.
- AI/LLM is part of the MVP.
- Demo mode is part of the MVP and must behave like a realistic production workflow.
- Scaling/growth recommendations are explicitly OUT of MVP.
- Learning, training, upskilling, courses, and education features are explicitly OUT.
- AWS Bedrock is OUT of MVP.
- Do not add features merely because they sound impressive.
- Prefer evidence-backed, deterministic calculations and explainable AI.

## Important implementation principle
Redefine the product before adding substantial new code. Audit the existing repository first, then implement the specification in tickets.

## Required engineering stack
- Next.js App Router
- TypeScript where the existing architecture supports it
- Neon PostgreSQL for now
- Prisma ORM
- Auth.js with secure cookie-based sessions
- Recharts + shadcn/ui for visualization
- Tailwind CSS
- Framer Motion for UI motion
- GSAP only for deliberate creative homepage choreography
- Lucide icons
- Zod for runtime validation
- Playwright for end-to-end testing
- ESLint + TypeScript checks
- pnpm

## Branching
Never work directly on `main`.
Use a feature/development branch, complete the relevant ticket, commit, push the branch, then merge into `main` only after review.

## Testing philosophy
Do not run unnecessary tests after every tiny change. Validate at meaningful ticket boundaries and before merges:
1. typecheck/lint when architecture or TS changes
2. targeted tests for changed behavior
3. Playwright for critical user flows
4. production build before merge/release

## NairaGuard — Product Redefinition

## One-line definition
**Cloud financial intelligence for businesses that don't have a dedicated FinOps team.**

## Core promise
**See where your AWS spend goes. Find the waste. Understand what it means in Naira.**

## The problem
Businesses can deploy workloads quickly but often lack a clear operational and financial view of:
- what is driving AWS spend
- where resources may be underutilized
- which optimization recommendations deserve attention
- what potential savings mean in local currency
- what evidence supports a recommendation

For Nigerian businesses, USD-denominated cloud costs also need Naira context.

## What NairaGuard is
NairaGuard is an AWS-focused cloud financial intelligence layer that:
1. ingests AWS cost/recommendation data
2. normalizes it into a consistent internal model
3. calculates financial metrics deterministically
4. identifies evidence-backed optimization opportunities
5. converts USD values into estimated NGN using an explicitly recorded FX rate
6. uses AI to explain findings, answer questions, and help users understand evidence

## What NairaGuard is NOT
- not a generic accounting platform
- not a replacement for AWS billing
- not an autonomous infrastructure modification tool
- not an investment/financial-advice product
- not a learning/upskilling platform
- not a cloud certification platform
- not a generic AI chatbot
- not an auto-scaling system in MVP

## Product principles
### 1. AWS remains the source of cloud truth
NairaGuard should not invent AWS usage, cost, or recommendation evidence.

### 2. Deterministic financial logic
Totals, percentages, aggregations, comparisons and NGN conversion are application logic, not LLM output.

### 3. AI explains; it does not fabricate
The LLM receives structured evidence and should explain it, identify uncertainty, answer follow-up questions, and suggest investigation steps.

### 4. Traceability
Important findings should show source, period, freshness and assumptions.

### 5. Human approval
NairaGuard recommends and explains. It does not silently change infrastructure.

### 6. Demo parity
Demo data must exercise the same application contracts and UI states as production wherever practical.

## MVP
### In scope
1. Authentication and account/session management
2. Production-grade dashboard
3. AWS cost visibility
4. Service/region/time-period analysis
5. Optimization opportunity detection/presentation
6. Naira/FX context
7. AI/LLM explanation and conversational follow-up
8. Controlled realistic demo mode
9. Secure AWS connection architecture prepared for live integration
10. Auditability, validation, error handling and security foundations
11. Responsive visual analytics
12. Core observability and operational safeguards

### Explicitly out of scope
- learning/upskilling
- courses/training
- AWS certification guidance
- auto-scaling
- automatic rightsizing execution
- automatic resource deletion
- autonomous infrastructure changes
- AWS Bedrock
- broad multi-cloud support
- complex enterprise FinOps allocation
- full forecasting product
- full unit economics product

These may become future roadmap items only after MVP proves the core workflow.

## Future direction, not MVP
Possible later expansion:
- scale/growth planning
- forecasting
- budgets and alerts
- commitment/discount analysis
- unit economics
- broader technology spend
- multi-cloud
- automated remediation with explicit approval
- enterprise governance

## NairaGuard — Homepage Content Direction

## Primary headline
**See where your AWS spend goes. Find the waste. Understand what it means in Naira.**

## Supporting message
AWS bills arrive in dollars. Your business plans in naira. NairaGuard connects the two — helping teams see what is driving cloud spend, identify optimization opportunities, and understand their estimated Naira impact.

## Hero CTA
Primary: **Try Demo**
Secondary: **See How It Works**

Small reassurance:
**Real product workflow · Synthetic demo data · No AWS account required for demo**

## Section: The problem
### Your cloud bill tells you what you spent. It doesn't always tell you what deserves attention.

AWS infrastructure can grow quietly: resources remain underused, services accumulate, and costs spread across regions and workloads.

For teams operating in Nigeria, USD spend also needs local financial context.

## Section: See
### See where the money is going.

Break down AWS spend by:
- service
- region
- period
- trend
- major cost drivers

## Section: Find
### Find the resources worth investigating.

Surface evidence-backed opportunities such as:
- underutilized compute
- storage inefficiency
- other supported optimization findings

Show:
- current estimated cost
- potential savings
- evidence
- effort
- risk/operational considerations
- source
- freshness

Do not promise guaranteed savings.

## Section: Understand
### Put the number in context.

Show USD as the underlying cloud value and NGN as an estimated equivalent using a recorded FX rate.

Always show:
- rate
- timestamp
- source
- estimation disclaimer

## Section: AI
### Ask the numbers what they mean.

NairaGuard's AI explains findings using the available evidence.

It can answer questions such as:
- Why is this resource flagged?
- What evidence supports this recommendation?
- What could change if we apply it?
- What should we validate before making a change?

The AI explains. It does not invent the numbers.

## Section: How it works
### Connect → Normalize → Analyze → Explain

1. Connect data
2. Normalize it
3. Calculate deterministic metrics
4. Surface opportunities
5. Explain the evidence

For demo mode, the same product workflow runs on controlled synthetic data.

## Section: Demo
### See the workflow before connecting an AWS account.

Use realistic synthetic cloud data to explore:
- spend
- waste signals
- recommendations
- Naira context
- AI explanations

## Section: Why NairaGuard
Use four concise ideas:
- **AWS-focused** — built around cloud cost and optimization data.
- **Naira-aware** — USD values with explicit NGN context.
- **Evidence-led** — recommendations remain tied to available evidence.
- **Built for operators** — designed for the people responsible for cloud infrastructure and its cost.

## Final CTA
### Make your AWS bill easier to understand.

**Try NairaGuard**

Secondary:
**Sign in**

## Copy rules
- Avoid filler.
- Avoid repeating the same promise in every section.
- Avoid excessive uppercase labels.
- Avoid technical implementation jargon unless it helps the user.
- Keep claims measurable and defensible.
- Never imply guaranteed savings.
- Never imply NairaGuard replaces AWS billing.
