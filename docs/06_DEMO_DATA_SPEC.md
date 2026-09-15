# Demo Data Specification

## Goal

Demo data must feel like a believable AWS environment.

It should not look like:

```text
EC2 = 10
RDS = 5
Savings = 100
```

It should resemble data that could plausibly come from AWS cost and optimization services.

## Required scenario types

### 1. Balanced Startup
Moderate AWS spend with several services.

### 2. Waste-Heavy Startup
Clear optimization opportunities.

### 3. EC2-Heavy Startup
Large compute allocation with rightsizing opportunities.

### 4. Storage-Heavy Startup
EBS/storage-related opportunities.

### 5. FX Pressure
Moderate USD cost but large Naira sensitivity.

## Demo data layers

### Layer 1 — Account metadata
Synthetic account ID, account name, regions, environment.

### Layer 2 — Cost snapshots
At least 90 days of daily or weekly synthetic cost data.

### Layer 3 — Service breakdowns
Examples:
- Amazon EC2
- Amazon RDS
- Amazon EBS
- Amazon S3
- AWS Lambda
- Amazon CloudWatch
- Amazon ECS
- NAT Gateway where appropriate

### Layer 4 — Recommendations
Each recommendation should include realistic source fields.

### Layer 5 — Resource metadata
Synthetic ARN-like identifiers and configurations.

### Layer 6 — FX history
USD/NGN values with timestamps.

### Layer 7 — AI analysis
AI output should be generated from the recommendation evidence, not hard-coded as financial truth.

## Data realism rules

- Use realistic relationships between costs and recommendations.
- Do not make every recommendation a huge saving.
- Include low, medium, and high effort.
- Include different regions.
- Include resources with no optimization opportunity.
- Include timestamps and freshness.
- Include cases where savings are zero or unavailable.
- Include at least one scenario with no recommendations.
- Include one scenario with provider error simulation.

## Demo mode labeling

Every dashboard should make it obvious when synthetic data is being used.

Recommended copy:

> Demo Mode — synthetic AWS FinOps data

Never imply that demo data is the user's real AWS account.
