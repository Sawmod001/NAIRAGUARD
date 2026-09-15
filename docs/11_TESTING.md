# Testing Strategy

## Testing layers

### Unit tests
Test pure domain logic.

Examples:
- USD → NGN conversion
- savings conversion
- percentage calculation
- recommendation priority
- FX fallback
- data normalization

### Provider contract tests
Both MockProvider and AWSProvider must satisfy the same domain contract.

The demo provider is not allowed to return a shape that the live provider could never satisfy.

### Integration tests
Test:
- database operations
- authentication/authorization boundaries
- recommendation persistence
- scenario switching
- provider failures

### AI tests
Use deterministic mock AI for most tests.

Validate:
- Zod schema
- missing fields
- invalid model output
- provider failure
- AI cannot alter financial truth

### End-to-end tests
Use Playwright.

Critical journeys:
1. sign up/sign in
2. open dashboard
3. switch demo scenario
4. view costs
5. view optimization list
6. open recommendation
7. see Naira conversion
8. handle empty state
9. handle provider failure
10. verify unauthorized access is blocked

## Test principle

Every important business rule should have a test.

Do not rely on screenshots as proof that business logic works.

## Recommended tooling

- Vitest for unit/integration tests
- Playwright for browser E2E
- Testing Library where component behavior requires it
- ESLint
- TypeScript strict mode

## CI gates

Before merge:
- typecheck
- lint
- unit tests
- integration tests
- build
- E2E smoke tests where configured
