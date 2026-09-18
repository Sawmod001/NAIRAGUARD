# NairaGuard — UI/UX & Creative Frontend System

## Brand
Primary: black
Supporting: white
Accent: red
Use the palette deliberately. Do not turn every component red.

## Product personality
NairaGuard should feel:
- technical
- confident
- editorial
- premium
- precise
- trustworthy
- modern

It must not look like a generic AI-generated SaaS dashboard.

## Homepage direction
The homepage is the creative signature of NairaGuard.

Reference inspiration for composition/art direction:
- Build in Amsterdam
- Noomo Agency

Do not clone either site. Extract principles:
- editorial composition
- strong typography
- controlled asymmetry
- deliberate whitespace
- image storytelling
- transitions between sections
- restrained but memorable motion

## Hero
Core message:
**See where your AWS spend goes. Find the waste. Understand what it means in Naira.**

Use the supplied business imagery from `public` as a storytelling element. Decide whether a hero placement or mid-page changing visual produces the stronger composition after inspecting the actual images. If animated image switching is used, it should tell a story rather than simply cycle.

## Typography
The user intends to explore modern display typography including Satoshi, Stardom and Array, with high-quality Indian/type-foundry alternatives researched where appropriate.

Do not load fonts through an invalid URL or random external stylesheet.
Inspect available font files/licensing and use a reliable self-hosted or official source.

Use a deliberate pairing:
- display font for selected hero/editorial moments
- highly readable body/UI font for product information

Use fluid typography with clamp where appropriate.

## Layout
Use:
- CSS Grid for page-level/editorial/two-dimensional composition
- Flexbox for one-dimensional component layouts
- container queries for reusable components where valuable
- subgrid where alignment genuinely benefits
- minmax/clamp/min/max
- aspect-ratio for media
- logical properties where appropriate

## Box model
Standardize:
- box-sizing
- spacing tokens
- section rhythm
- container widths
- media sizing
- border treatment
- radius hierarchy

Do not use one radius for everything.
Some compositions may intentionally use sharp corners.

## Color fields
The homepage may alternate black/white/red-led sections, but transitions must feel art-directed rather than like arbitrary blocks.

## Motion
Use:
- Framer Motion for normal UI/component transitions
- GSAP for sophisticated homepage choreography
- ScrollTrigger only where scroll itself communicates something
- SplitText only for selected display typography
- FLIP only where layout/state transformation benefits
- CSS scroll-driven animation for simple effects when appropriate

Do NOT use every technique listed in the inspiration brief.

## Motion rules
Prefer:
- transform
- opacity
- clip-path where appropriate
- compositor-friendly properties

Avoid unnecessary layout animation.

Respect:
`prefers-reduced-motion`

Desktop-only cursor effects must be disabled on touch devices.

## Navigation
Desktop:
Product · How it works · Demo · Why NairaGuard · Try Demo · Sign in

The nav may transform subtly on scroll.
Mobile must have a proper accessible menu.

## Product UI
Dashboard pages should prioritize information architecture and readability over decorative effects.

Use Recharts + shadcn/ui.
Charts should answer questions, not decorate empty space.

Potential visualizations:
- spend trend
- service distribution
- regional distribution
- optimization savings
- cost vs previous period
- FX impact/context

Do not add charts without useful data.

## Accessibility
- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- reduced motion
- accessible chart summaries where practical
- meaningful labels
- touch targets

## NairaGuard — Engineering Architecture

## Principle
Keep domain logic independent from UI and external providers.

Recommended conceptual boundaries:

src/
  app/
  components/
  features/
  lib/
    auth/
    aws/
    ai/
    fx/
    db/
    validation/
    domain/
    observability/

Do not force an exact folder structure if the current repository has a better equivalent. Preserve a clean separation of responsibilities.

## Provider interfaces
External systems should be behind adapters/interfaces:
- AWS provider
- FX provider
- AI provider
- authentication provider

The domain should not know vendor-specific details unnecessarily.

## Server/client boundary
Sensitive work remains server-side:
- database access
- AWS credentials
- STS
- AI secrets
- FX provider secrets if any
- authorization

Client components receive only the minimum data required for rendering.

## Server Actions vs API routes
Use Server Actions for simple authenticated mutations tightly coupled to the application UI.
Use Route Handlers/API endpoints where:
- external callbacks/webhooks are needed
- a stable API boundary is useful
- streaming or programmatic access needs an HTTP endpoint
- separation from UI is beneficial

Do not introduce GraphQL for MVP unless a demonstrated requirement appears.

## Validation
Use Zod at external boundaries:
- form input
- route payloads
- provider responses where practical
- AI structured outputs
- configuration

## Errors
Use typed/domain errors.
Never expose raw AWS/provider errors directly to users.

## Caching
Use caching carefully for expensive AWS reads and immutable/periodic datasets.
Never serve stale cost data without showing freshness.

## Observability
Prepare structured logs and error tracking hooks.
Never log secrets, tokens or sensitive customer data unnecessarily.

## NairaGuard — Security Checklist

Before production integration:

## Authentication
- Auth.js secure cookie sessions
- password/auth provider flow selected deliberately
- secure session configuration
- protected server routes
- authorization separate from authentication

## Authorization
Every protected operation verifies:
1. authenticated user
2. authorized workspace/account
3. authorized AWS connection/resource scope

Never trust IDs supplied by the browser.

## Secrets
Keep in server environment:
- Auth.js secret
- database URL
- AWS integration credentials/config
- AI API key
- FX API key if applicable

Never expose secrets through `NEXT_PUBLIC_*`.

## AWS
- least privilege
- temporary credentials
- role assumption
- explicit external ID/anti-confused-deputy design where appropriate
- customer account isolation
- no permanent access keys requested by default

## Application
- CSRF/session protections
- XSS-safe rendering
- SQL injection protection through Prisma
- input validation
- rate limiting on expensive/sensitive endpoints
- secure headers
- dependency updates
- safe file/upload handling if introduced

## AI
Treat model output as untrusted text.
Do not allow model output to directly execute infrastructure operations.
Any future action capability must require explicit authorization and approval.

## Audit
Record security-sensitive events without storing secrets:
- connection created/changed
- authorization changes
- integration failures
- sensitive account actions

## NairaGuard — Testing & Quality

## Do not over-test
Testing is required, but do not run a full test suite after every CSS tweak.

### Targeted validation
For a UI-only change:
- typecheck if types changed
- lint if relevant
- visually inspect

For domain/data changes:
- targeted unit tests
- typecheck
- lint

For auth/AWS/critical flows:
- targeted integration tests
- Playwright for user-visible flow

Before merge:
- lint
- typecheck
- relevant tests
- Playwright critical flows
- production build

## Critical Playwright flows
At minimum:
1. unauthenticated user reaches public homepage
2. sign up/sign in
3. protected dashboard access
4. demo entry after authentication
5. dashboard renders demo data
6. cost analysis
7. optimization detail
8. AI explanation/follow-up
9. sign out
10. unauthorized data access is rejected

## Domain unit tests
Test deterministic:
- money calculations
- USD→NGN conversion
- rounding
- percentage calculations
- cost aggregation
- savings aggregation
- scenario consistency
- authorization boundaries

## Production readiness
No merge if:
- TypeScript errors
- lint errors
- broken auth boundary
- secrets exposed client-side
- demo and production domain models diverge without reason
- calculations are delegated to the LLM
