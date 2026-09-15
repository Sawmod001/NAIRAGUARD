# NairaGuard — Build Documentation Pack

NairaGuard is a Naira-aware AWS FinOps intelligence product.

## Product sentence

> NairaGuard helps Nigerian startups and professionals understand AWS spending, identify credible cloud-waste opportunities, and translate potential savings into estimated Naira impact.

## Current development mode

The project is being built **Demo-First**.

- Demo Mode is the primary implementation target.
- Live AWS Mode is a future provider implementation.
- Demo data must behave like realistic AWS data, not like a toy mock.
- The UI, domain logic, database model, recommendation engine, AI explanation layer, error states, and testing architecture should be designed so that a live AWS provider can later replace the demo provider without rewriting the product.

## Non-negotiable product principles

1. AWS/deterministic financial data is the source of truth.
2. AI explains, summarizes, prioritizes, and contextualizes; it does not invent savings.
3. Naira values are estimates based on an explicitly timestamped FX rate.
4. The MVP is read-only.
5. No destructive AWS actions are implemented in the MVP.
6. Every important number has a source and freshness context.
7. Demo data is synthetic and must be clearly labeled as such.
8. Tenant/account isolation is enforced on the server.
9. Business logic is separated from UI components.
10. Provider abstractions make Demo Mode and Live AWS Mode interchangeable.
