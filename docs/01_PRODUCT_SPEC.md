# NairaGuard Product Specification

## 1. Problem

AWS bills are denominated in USD, while Nigerian businesses budget and operate in Naira. The combination of dollar-denominated cloud spend, exchange-rate movement, underutilized resources, and poor visibility can make cloud costs difficult to understand and control.

NairaGuard is not simply a cloud dashboard. It is a FinOps decision-support product.

## 2. Target users

### Primary MVP users
- Startup founders
- Technical founders
- Software engineers responsible for cloud infrastructure
- Small engineering teams
- Technical/product professionals managing AWS costs

### Initial account model
A user creates an account and belongs to one organization/workspace.

The MVP can keep organization membership simple, but the data model should not prevent future team roles.

## 3. Core user questions

NairaGuard must answer:

1. How much am I spending?
2. What services are consuming the most?
3. Where is the likely waste?
4. How much could I potentially save?
5. What would those savings mean in Naira?
6. What should I investigate or do next?
7. How reliable is this recommendation?

## 4. Product pillars

### SEE
Understand AWS cost.

- Current-period spend
- Previous-period comparison
- Service breakdown
- Regional breakdown where available
- Cost trend
- Last synchronization time

### SAVE
Find optimization opportunities.

- Rightsizing
- Idle resources
- Storage optimization
- Commitment opportunities where supported by the source
- Other AWS-supported optimization recommendations

AWS Cost Optimization Hub consolidates and prioritizes optimization recommendations and provides estimated monthly savings. AWS documents recommendations such as rightsizing, idle resource deletion, Savings Plans and Reserved Instances. citeturn0search0turn0search7

### PROTECT
Understand Naira exposure.

- USD cost
- Estimated NGN equivalent
- FX rate used
- FX timestamp/source
- Naira impact of potential savings
- Future budget/FX protection capabilities

## 5. MVP promise

A signed-in user can enter Demo Mode and experience a credible AWS FinOps workflow:

Sign in → open dashboard → inspect spend → identify cost drivers → inspect savings opportunities → understand recommendation → see USD and estimated NGN savings → decide what action to investigate.

## 6. What MVP does NOT do

- No automatic AWS resource changes
- No real AWS credentials required for Demo Mode
- No multi-account organization management
- No Slack/WhatsApp/email alerts
- No advanced anomaly ML
- No Terraform generation
- No Kubernetes cost analysis
- No automated remediation
- No enterprise billing reconciliation
- No mobile app
- No arbitrary AWS service support

## 7. Important financial terminology

### Actual cost
Cost data originating from AWS billing/cost data.

### Estimated monthly cost
An estimate of monthly resource cost. It is not a promise of future billing.

### Estimated monthly savings
Potential savings estimated by the recommendation source. AWS notes that actual realized savings depend on future usage patterns. citeturn0search1

### Potential savings
Savings that could be achieved if a recommendation is implemented.

### Realized savings
Savings actually observed after an optimization is implemented. This is future functionality.

### Estimated Naira equivalent
USD amount multiplied by the selected FX rate.

Formula:

`NGN equivalent = USD amount × USD/NGN rate`

This must never be presented as the exact bank/card charge.

### Cost driver
A service, resource category, region, or other dimension responsible for a meaningful portion of spend.

### Savings opportunity
A credible optimization finding with an estimated savings value.

### FinOps
A discipline combining engineering, finance, operations, and business decision-making to manage cloud value and cost.

## 8. Recommendation philosophy

NairaGuard should never create a savings number merely because an LLM says one.

Recommendation data should contain source evidence first:

- source
- resource
- current configuration
- recommended configuration/action
- estimated monthly cost
- estimated monthly savings
- savings percentage if available
- implementation effort
- restart requirement
- rollback possibility
- region
- timestamp

AI may then explain the evidence in plain language.

AWS Cost Optimization Hub and Compute Optimizer already expose recommendation/savings concepts that should guide our domain model. citeturn0search3turn0search4turn0search5
