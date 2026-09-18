# NairaGuard — AWS Integration, Security & Production Model

## Target production flow

User
→ NairaGuard Auth.js session
→ NairaGuard server
→ secure AWS connection
→ AWS APIs
→ normalization layer
→ deterministic analysis
→ database/cache
→ dashboard + AI explanation

The browser must not directly hold AWS secret credentials.

## Preferred AWS account connection model

For a real customer integration, prefer cross-account IAM access using an AWS IAM role that NairaGuard can assume through AWS STS.

Conceptually:
1. Customer chooses Connect AWS.
2. NairaGuard provides account/role setup instructions or an onboarding mechanism.
3. Customer creates/configures a least-privilege IAM role in their AWS account.
4. The role trusts the NairaGuard integration identity.
5. NairaGuard obtains temporary credentials through STS AssumeRole.
6. Server-side AWS SDK calls the permitted AWS APIs.
7. Temporary credentials expire automatically.
8. NairaGuard stores identifiers/configuration, not long-lived customer access keys.

Do not design around asking customers to paste permanent AWS access keys into the browser.

## AWS services likely relevant
The exact API set must be validated during implementation and against current AWS documentation:
- AWS Cost Explorer / Cost Explorer API for cost and usage analysis
- AWS Cost Optimization Hub for consolidated optimization findings where available
- AWS Compute Optimizer for supported resource recommendations
- AWS STS for temporary role credentials
- IAM for access control

Do not assume every customer has every service enabled or every recommendation source available.

## Cost considerations
The application must clearly distinguish:
- NairaGuard subscription/application costs
- AWS API/service charges
- free/paid AWS capabilities
- customer-owned AWS costs

Do not hard-code claims that every AWS API is free. Validate current AWS pricing/documentation for each integration used.

## Security requirements
- server-side AWS calls only
- least-privilege IAM
- temporary credentials where possible
- never log secrets
- never expose AWS credentials to client components
- encrypt sensitive configuration at rest where required
- secure HTTP-only cookies for sessions
- CSRF protections appropriate to Auth.js architecture
- validate all external input with Zod
- authorization checks at server boundaries
- tenant/account isolation
- rate limiting for sensitive endpoints
- audit security-sensitive actions
- safe error messages that do not leak credentials/account data
- dependency/security scanning as practical

## Multi-tenancy
Every production record must be scoped to the authenticated user/account/organization boundary. Never rely on client-supplied tenant IDs for authorization.

## Data freshness
Every imported AWS dataset should carry:
- source
- source account identifier/reference
- collection/import timestamp
- source period
- freshness/status
- demo/live indicator where relevant

## Failure states
Design for:
- missing IAM permission
- expired/invalid role access
- AWS throttling
- API unavailable
- partial data
- unsupported region/resource
- Cost Explorer delay
- recommendation source unavailable
- FX provider failure
- AI provider failure

A failure in AI must not break deterministic financial data.

## NairaGuard — Data Model & Production-Grade Demo

## Database decision
Keep **Neon PostgreSQL + Prisma** for now.

Do NOT introduce another database merely because it is fashionable.

Neon is PostgreSQL-compatible and is sufficient for the MVP. A future migration to another PostgreSQL deployment should be straightforward if the application remains PostgreSQL-native and avoids unnecessary provider-specific coupling.

## Core entities
The exact schema must be designed from the repository after audit, but the conceptual model includes:
- User
- Session / Auth.js entities
- Workspace or Account boundary if needed
- AwsConnection
- CostSnapshot
- CostServiceBreakdown
- CostRegionBreakdown
- OptimizationOpportunity
- Evidence
- FxRate
- AiConversation / AiMessage
- DemoScenario
- AuditEvent

Use stable IDs and timestamps. Add appropriate indexes and unique constraints.

## Money representation
Do not use floating point for authoritative monetary calculations.

Prefer integer minor units where appropriate:
- USD cents
- NGN kobo

Store the FX rate and timestamp used for a conversion.

## Demo philosophy
Demo is not a toy.

It should use realistic, internally consistent synthetic AWS-style data and exercise the same domain model and UI contracts used by production.

Demo data must be clearly labelled as synthetic/demo data.

## Demo scenarios
Maintain a small controlled set such as:
- Balanced Startup
- Waste-heavy
- EC2-heavy
- FX Pressure

Each scenario should contain internally consistent:
- time period
- total cost
- service breakdown
- region breakdown
- optimization opportunities
- evidence
- FX snapshot

Avoid random generation that produces contradictory numbers.

## Deterministic invariants
Example:
service totals should reconcile with total spend within defined rounding rules.
Optimization savings should not exceed the associated cost without an explicit reason.
NGN = USD × recorded FX rate, using the application's defined rounding policy.

## Production parity
The UI should not have a completely separate fake implementation. Prefer:
AWS adapter → normalized domain model
Demo adapter → same normalized domain model
Both feed the same analysis/services/UI.

This is one of the most important architectural decisions in the project.

## NairaGuard — Environment Template

Never commit real secrets.

Example categories only; use exact variables required by the implemented libraries/providers.

```env
# Database
DATABASE_URL=

# Auth.js
AUTH_SECRET=

# AWS integration — server only
AWS_REGION=
AWS_ROLE_ARN=
AWS_EXTERNAL_ID=

# AI provider — server only
AI_API_KEY=

# FX provider — server only if required
FX_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=
```

Rules:
- never use `NEXT_PUBLIC_` for secrets
- `.env.local` remains untracked
- document required variables
- validate required production configuration at startup
- provide safe demo configuration where appropriate
