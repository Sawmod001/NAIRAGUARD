# Security Specification

## MVP security posture

Demo Mode must still be built like a real multi-tenant application.

## Authentication

Use Auth.js (NextAuth v5) with Prisma/PostgreSQL and secure httpOnly session cookies. Application owns identity/authorization; Auth.js handles cryptographic session, password hashing (bcrypt), CSRF and OAuth mechanics. No `NEXT_PUBLIC_` auth secrets.

## Authorization

Authentication answers:
> Who are you?

Authorization answers:
> Which organization/account/data can you access?

Every server-side read/write must enforce authorization.

## Tenant isolation

All tenant-owned data must be scoped through organization membership.

Never trust organization IDs supplied by the browser.

## Live AWS security

Future AWS connection must use:
- IAM role
- STS temporary credentials
- external ID for third-party access
- least privilege
- no long-lived AWS access keys in the application

## Demo security

Demo mode must not:
- store fake AWS secrets
- ask users for AWS access keys
- imply that demo credentials are real

## Secrets

Environment variables:
- never commit
- never render into client components
- never return from server actions/API responses

## Logging

Never log:
- API keys
- AWS secret material
- authentication tokens
- full credential payloads

Log:
- event type
- organization ID where appropriate
- request correlation ID
- provider status
- non-sensitive error category

## Database

Use parameterized ORM queries through Prisma.

Use indexes for common tenant/provider lookups.

## AI

Do not send:
- credentials
- access tokens
- unnecessary personal data

Only send the minimum recommendation evidence required for explanation.
