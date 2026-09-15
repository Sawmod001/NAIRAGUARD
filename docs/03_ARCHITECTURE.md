# NairaGuard Architecture

## Architectural goal

Keep the application easy to scale from:

Demo → Live AWS → multiple AWS accounts → richer FinOps features.

The key rule is:

> UI components must not know how AWS works.

## High-level architecture

```text
                ┌──────────────────────┐
                │      Next.js UI      │
                │ Server + Client UI   │
                └──────────┬───────────┘
                           │
                    Application Layer
                           │
              ┌────────────┼────────────┐
              │            │            │
        Cost Service   Savings Service  FX Service
              │            │            │
              └────────────┼────────────┘
                           │
                    Provider Interfaces
                 ┌─────────┼──────────┐
                 │         │          │
            Mock AWS    AWS Live    Mock/Live FX
             Provider    Provider      Provider
                 │         │          │
                 └─────────┼──────────┘
                           │
                    FinOps Domain Engine
                           │
                     AI Explanation
                           │
                       PostgreSQL
```

## Provider abstraction

Define conceptual interfaces:

### CostProvider
Responsible for retrieving cost information.

### OptimizationProvider
Responsible for retrieving AWS-supported optimization recommendations.

### ResourceProvider
Responsible for resource metadata when available.

### FXProvider
Responsible for obtaining USD/NGN exchange rates.

### AIProvider
Responsible for structured recommendation explanation.

The first implementation is Demo/Mock.

The second implementation is AWS.

## Why this matters

Without provider abstraction, the app becomes coupled to AWS SDK calls throughout the UI and business logic.

With provider abstraction:

```text
DemoProvider ─────┐
                  ├──> FinOps domain ──> UI
AWSProvider ──────┘
```

The domain logic does not care where the data came from.

## Recommended application layers

### Presentation
- routes
- pages
- components
- charts
- forms

### Application
- use cases
- orchestration
- authorization checks
- synchronization workflows

### Domain
- cost calculations
- savings calculations
- recommendation scoring
- financial terminology
- validation

### Infrastructure
- Prisma
- authentication adapter
- demo provider
- AWS provider
- FX provider
- AI provider

## Important rule

Do not put AWS SDK calls directly inside React components.

Do not put complex FinOps calculations directly inside JSX.

Do not let an LLM become the source of truth for financial values.
