# Routes and Pages

## Public pages

### `/`
Creative marketing homepage.

Purpose:
- explain the problem
- establish trust
- demonstrate Naira-aware FinOps positioning
- encourage sign up

The homepage should have a distinct visual identity and should not look like a generic SaaS template.

### `/sign-in`
Authentication.

### `/sign-up`
Authentication.

### `/privacy`
Privacy information.

### `/terms`
Terms/product-use information.

## Authenticated application

### `/dashboard`
Primary overview.

Sections:
- total AWS spend
- estimated NGN equivalent
- potential monthly savings
- savings opportunity count
- cost trend
- top cost drivers
- optimization highlights
- data freshness

### `/costs`
Detailed cost analysis.

Sections:
- time range
- total cost
- service breakdown
- region breakdown
- trend
- comparison

### `/optimizations`
Recommendation list.

Filters:
- service/resource type
- effort
- savings
- source
- status

### `/optimizations/[id]`
Recommendation detail.

Sections:
- resource
- current state
- recommended state
- estimated cost
- estimated savings
- NGN equivalent
- risk/effort
- evidence
- AI explanation

### `/settings`
User/application settings.

MVP:
- profile
- demo scenario
- currency display preference
- data/source information

Future:
- AWS connection
- organization
- notification settings
- budgets

## Future routes

These should not be built now, but the architecture must leave room for:

- `/aws`
- `/aws/connect`
- `/budgets`
- `/alerts`
- `/accounts`
- `/team`
- `/settings/security`
- `/reports`

## Navigation rule

Keep the MVP navigation small.

Recommended MVP navigation:

Dashboard | Costs | Optimizations | Settings

Do not create pages merely because the database has a model.
