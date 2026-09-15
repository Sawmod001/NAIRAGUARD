# Conceptual Data Model

Prisma + PostgreSQL is the selected database approach.

The database is for application state, history, user/workspace state, cached provider data, and AI interpretations. It is not a blind replica of AWS.

## Core entities

### User
Authentication identity.

### Organization
Workspace/tenant boundary.

### Membership
Future-proof relationship between users and organizations.

### AWSAccount
Represents a connected AWS account in Live Mode.

Demo Mode may use a synthetic account record.

### ProviderConnection
Tracks provider mode/status without storing secrets.

### CostSnapshot
A point-in-time or period-based cost record.

Important fields conceptually:
- organizationId
- accountId
- periodStart
- periodEnd
- amountUsd
- fxRate
- amountNgn
- source
- observedAt

### CostBreakdown
Breakdown belonging to a snapshot.

Examples:
- service
- region
- amountUsd
- amountNgn
- percentage

### Recommendation
The canonical optimization opportunity.

Important fields:
- source
- externalId
- resourceId
- resourceArn
- resourceType
- actionType
- region
- currentConfiguration
- recommendedConfiguration
- estimatedMonthlyCostUsd
- estimatedMonthlySavingsUsd
- savingsPercentage
- effort
- restartRequired
- rollbackPossible
- status
- observedAt

### AIAnalysis
AI interpretation of an existing recommendation.

Fields:
- recommendationId
- summary
- whyItMatters
- actionPlan
- priority
- confidence
- model
- createdAt

### FxRate
Cached FX rate.

Fields:
- base
- quote
- rate
- provider
- observedAt
- expiresAt

### DemoScenario
Identifies the synthetic dataset/scenario.

### Budget
Future-ready model; not heavily used in MVP.

### Alert
Future-ready model; not heavily used in MVP.

## Data ownership

Organization owns:
- demo scenario
- snapshots
- breakdowns
- recommendations
- AI analyses
- FX records

Users access data only through authorized organization membership.

## Database rules

- Every tenant-owned query must be scoped by organization.
- External provider IDs should be indexed.
- Recommendation external IDs should support idempotent upserts.
- Timestamps should be stored in UTC.
- Money calculations should avoid floating-point errors where exact arithmetic is required.
- Store original USD values separately from converted NGN values.
- Never overwrite historical FX data when a new rate arrives.
