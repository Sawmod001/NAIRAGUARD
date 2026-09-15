# Coding Standards

## TypeScript

Use strict TypeScript.

Avoid `any`.

Prefer explicit domain types and Zod validation at external boundaries.

## Naming

- PascalCase for React components/classes
- camelCase for variables/functions
- descriptive domain names
- no abbreviations that hide meaning

## React

Prefer server components by default.

Use client components only where interactivity/browser APIs require them.

Do not put business logic into presentation components.

## Next.js

Use App Router.

Keep route handlers/server actions thin.

Call application services from the server boundary.

## Database

Use Prisma as the database access layer.

Keep Prisma calls behind repository/service boundaries where doing so improves maintainability.

Avoid creating multiple Prisma Client instances in development; use the established singleton pattern. Prisma documents this as a Next.js development best practice. citeturn0search10

## AWS

Keep AWS SDK calls inside provider adapters.

Normalize AWS responses into NairaGuard domain objects.

Never leak AWS SDK response shapes throughout the UI.

## Money

Never use floating-point arithmetic casually for monetary persistence.

Keep:
- original provider amount
- normalized numeric representation
- converted Naira representation

The exact implementation should be decided before database coding.

## Errors

Use typed/domain error categories.

Do not expose raw provider stack traces to users.

## UI

Use reusable components.

Avoid one-off duplicated cards.

Do not make every section a rounded rectangle.

Homepage can be experimental/creative; application dashboard should prioritize clarity.

## Accessibility

- keyboard navigation
- visible focus
- semantic HTML
- sufficient contrast
- reduced-motion support
- meaningful labels

## Performance

- cache provider data
- avoid unnecessary client-side fetching
- avoid calling APIs from render loops
- lazy-load expensive visual effects
- keep animation off the critical data path
