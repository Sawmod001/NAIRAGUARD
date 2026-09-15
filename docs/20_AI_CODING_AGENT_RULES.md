# AI Coding Agent Rules

You are working on NairaGuard.

## Mission

Build a production-minded Demo-First FinOps application, not a visual prototype.

## Before coding

1. Read all relevant files in `/docs`.
2. Read the current Scrum ticket.
3. Inspect the existing codebase.
4. Do not invent architecture that conflicts with the documentation.
5. Do not implement future features unless the ticket explicitly requires them.

## Coding rules

- TypeScript strict.
- No unnecessary `any`.
- Server-side authorization.
- Business logic outside UI components.
- Provider adapters isolate external services.
- Validate external input with Zod.
- Keep server actions/route handlers thin.
- Use Prisma for database access.
- Never expose secrets to the client.
- Do not call external APIs repeatedly from rendering paths.
- Add loading, empty, error, and success states.
- Write tests for important business rules.
- Preserve accessibility.
- Preserve reduced-motion support.

## Financial rules

- Never let AI invent or modify financial values.
- Store/display USD and NGN separately.
- Label NGN as an estimate.
- Show FX timestamp/source.
- Distinguish potential from realized savings.
- Do not double-count savings.

## Demo rules

- Demo data must be synthetic.
- Demo data must be clearly labeled.
- Demo scenarios must be deterministic enough for tests.
- Mock provider contracts must match future live provider contracts.

## AWS rules

- No AWS SDK calls in React components.
- No long-lived AWS access keys.
- Live AWS provider is future work unless explicitly assigned.
- Normalize AWS response data before it reaches UI/application logic.

## UI rules

- Homepage is creative.
- Dashboard is information-dense but calm.
- Do not turn every section into a card.
- Avoid generic SaaS-template design.
- Animations must have a purpose.
- Do not sacrifice usability for visual effects.

## Ticket discipline

For every ticket:
1. state what will change
2. state what will not change
3. implement smallest complete slice
4. test
5. verify build
6. report files changed
7. report remaining risks

Never silently expand scope.
