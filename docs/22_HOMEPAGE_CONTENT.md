# NairaGuard Homepage Content

## Purpose

This document is the source of truth for the public NairaGuard homepage copy and content hierarchy.

The homepage is a product story, not a generic SaaS template. It should move the visitor through three core ideas:

**SEE → FIND → UNDERSTAND**

- See where AWS spend goes.
- Find the waste and optimization opportunities.
- Understand what the numbers mean in Naira.

The homepage must make the product understandable before it becomes visually impressive.

---

## 1. Navigation

### Brand

**NairaGuard**

Optional supporting descriptor where space allows:

**AWS FinOps, built with Naira in mind.**

### Navigation

- Product
- How it works
- Demo
- Why NairaGuard

### Actions

Primary:

**Try Demo**

Secondary:

**Sign in**

Do not use vague CTA labels such as “Get Started” when a more specific action is possible.

---

# 2. Hero

## Eyebrow

**AWS FINOPS / BUILT FOR NAIRA-AWARE TEAMS**

## Primary headline

**See where your AWS spend goes. Find the waste. Understand what it means in naira.**

This is the central homepage statement and should remain visually dominant.

## Supporting copy

AWS bills arrive in dollars. Your business plans in naira. NairaGuard connects the two — giving you a clearer view of cloud spend, optimization opportunities, and their estimated Naira equivalent.

## Primary CTA

**Explore the Demo**

## Secondary CTA

**See how it works**

## Small trust/context line

**Demo Mode · No AWS account required**

## Hero visual story

The hero visual should not be a random cloud illustration.

It should communicate a sequence:

**AWS resources → cloud spend → waste signal → potential savings → ₦ impact**

The visual may combine infrastructure-inspired imagery with financial data and animated transitions.

The hero should make the product understandable even if the visitor reads none of the supporting sections.

---

# 3. Problem Section — The Bill Is in Dollars

## Eyebrow

**THE CLOUD COST PROBLEM**

## Heading

**Your infrastructure runs in AWS. Your business runs in naira.**

## Body

Cloud infrastructure can be easy to deploy and difficult to understand financially. Usage grows, resources stay idle, services become over-provisioned, and the final bill arrives in USD.

For Nigerian teams, the number on the bill is only part of the story. Exchange-rate movement can change what that same cloud spend means in the local budget.

## Supporting points

- Spend is spread across services and resources.
- Waste can remain invisible until someone investigates it.
- AWS pricing and optimization evidence can be difficult to interpret quickly.
- USD-denominated costs need local context.

## Visual direction

Use a strong editorial composition rather than four generic cards.

Possible visual language:

`USD → AWS usage → hidden waste → NGN` 

The orange accent should identify the financial tension rather than decorate the entire section.

---

# 4. See — Cost Visibility

## Eyebrow

**01 / SEE**

## Heading

**Know what your cloud bill is actually doing.**

## Body

NairaGuard turns cloud-cost data into a clearer view of where money is going — across services, regions, trends, and major cost drivers.

## Content labels

- Current spend
- Cost trend
- Top services
- Regional spend
- Period comparison
- Last synchronization

## Microcopy

**What is driving the bill?**

**Which services deserve attention?**

**Is spend moving in the direction you expect?**

## Visual

A product visualization should show a believable cost overview, not a decorative dashboard screenshot.

Use real domain concepts such as:

- EC2
- RDS
- EBS
- S3
- Lambda

Do not invent unsupported financial claims.

---

# 5. Find — Waste & Optimization

## Eyebrow

**02 / FIND**

## Heading

**The expensive resource is not always the biggest resource.**

## Body

NairaGuard surfaces optimization opportunities using evidence from the underlying cost and recommendation data. That can include idle resources, rightsizing opportunities, storage-related waste, and other supported recommendations.

## Opportunity language

Use:

- Potential savings
- Estimated monthly savings
- Cost driver
- Optimization opportunity
- Implementation effort
- Performance risk
- Restart required
- Rollback possible

Avoid:

- Guaranteed savings
- Instant savings
- AI discovered savings
- Zero-risk optimization

## Example recommendation copy

**EC2 rightsizing opportunity**

Current estimated monthly cost: **$286.40**

Estimated monthly savings: **$118.70**

Implementation effort: **Low**

Restart required: **Yes**

Potential saving: **41.4%**

The percentage and monetary values must come from deterministic application calculations or trusted provider data, never from an LLM invention.

## CTA

**Inspect an opportunity**

---

# 6. Understand — Naira Context

## Eyebrow

**03 / UNDERSTAND**

## Heading

**A dollar saving means something different when your budget is in naira.**

## Body

NairaGuard translates USD costs and potential savings into an estimated Naira equivalent using a recorded exchange rate and timestamp.

## Example visual

`$118.70`  →  `₦184,?00` 

The exact demo value should be generated from the active demo FX rate. Do not hard-code a misleading static conversion into marketing copy.

## Required qualifier

**Estimated Naira equivalent · FX rate and timestamp shown in product**

## Important distinction

The homepage must never imply that the Naira equivalent is the exact amount a Nigerian bank account or card will be charged.

---

# 7. Product Story / How It Works

## Eyebrow

**HOW NAIRAGUARD WORKS**

## Heading

**From cloud data to a decision you can act on.**

## Four stages

### 01 — Connect

Bring in the relevant AWS cost and recommendation data.

Demo Mode can be used without a live AWS connection.

### 02 — Normalize

NairaGuard turns provider data into a consistent internal model so costs and recommendations can be compared and displayed consistently.

### 03 — Calculate

Deterministic application logic calculates totals, percentages, aggregates, and Naira equivalents.

### 04 — Explain

AI can help explain the evidence, risks, and next steps in plain language.

**AI explains the numbers. It does not invent them.**

---

# 8. Recommendation Detail Story

## Heading

**Don't just see a recommendation. Understand it.**

## Body

A useful optimization recommendation should show the evidence behind it — what is running, what is recommended, what it costs, what could potentially be saved, and what implementation might involve.

## Evidence labels

- Current resource
- Recommended resource
- Estimated monthly cost
- Estimated monthly savings
- Savings percentage
- Utilization evidence
- Implementation effort
- Restart required
- Rollback possible
- Region
- Source
- Data freshness

## CTA

**View recommendation details**

---

# 9. Demo Mode Section

## Eyebrow

**START WITHOUT AWS CREDENTIALS**

## Heading

**See the workflow before you connect an account.**

## Body

Explore a realistic NairaGuard FinOps workflow using controlled AWS-style data. Inspect costs, investigate waste, review recommendations, and see the Naira context without connecting a live AWS account.

## CTA

**Enter Demo Mode**

## Status label

**Demo data · clearly labelled · no live AWS access**

The demo should feel like the real product, not a toy preview.

---

# 10. Technical Credibility Section

## Eyebrow

**BUILT FOR ENGINEERING TEAMS**

## Heading

**Clear numbers. Traceable recommendations. No magic savings.**

## Body

NairaGuard is designed around a simple separation: provider data supplies evidence, application logic performs financial calculations, and AI helps explain what the evidence means.

## Principles

**Provider evidence**

Cost and optimization findings originate from the underlying provider data.

**Deterministic calculations**

Totals, percentages, conversions, and aggregates are calculated by application logic.

**Explainable AI**

AI can summarize evidence, identify important considerations, and suggest investigation steps without becoming the source of financial truth.

**Security first**

Live AWS integration will use short-lived, least-privilege access patterns rather than long-lived access keys.

---

# 11. NairaGuard Difference

## Eyebrow

**WHY NAIRAGUARD**

## Heading

**Cloud cost visibility with local financial context.**

## Copy blocks

### Cloud-first

Built around AWS cost, resource, and optimization concepts rather than generic expense tracking.

### Naira-aware

USD figures can be understood alongside estimated Naira equivalents and FX context.

### Evidence-led

Recommendations are tied to source data and supporting evidence.

### Engineering-minded

Designed for people who actually work with the infrastructure behind the bill.

Avoid generic claims such as “the smartest FinOps platform” or “the world's best cloud optimizer.”

---

# 12. Final CTA

## Eyebrow

**YOUR CLOUD BILL HAS A STORY**

## Heading

**See it clearly. Find what matters.**

## Body

Start with Demo Mode and explore how NairaGuard turns AWS cost data into a clearer FinOps workflow for Naira-aware teams.

## Primary CTA

**Explore NairaGuard**

## Secondary CTA

**Sign in**

---

# 13. Footer

### Brand line

**NairaGuard**

**AWS FinOps, built with Naira in mind.**

### Product

- Dashboard
- Costs
- Optimizations
- Demo

### Company / Legal

- Privacy
- Terms

### Status / environment

When appropriate:

**Demo Mode**

Do not imply live AWS connectivity when the application is running in Demo Mode.

---

# 14. Homepage Microcopy Rules

Prefer concrete language:

- See spend
- Find waste
- Review opportunity
- Estimated savings
- Estimated Naira equivalent
- View evidence
- Investigate recommendation
- Data refreshed

Avoid vague AI-SaaS language:

- Unlock the future
- Transform your cloud
- Intelligent insights
- Next-generation platform
- Supercharge your infrastructure
- Revolutionary AI
- Seamless optimization

The homepage should sound like an engineering product that understands money, not a marketing generator.

---

# 15. Content Rules

1. Do not claim actual savings when the product only shows potential or estimated savings.
2. Do not claim live AWS access in Demo Mode.
3. Do not imply that an estimated Naira equivalent is a bank/card charge.
4. Do not let AI-generated copy become the source of financial truth.
5. Use “estimated” where the underlying number is estimated.
6. Keep technical credibility visible without turning the homepage into documentation.
7. Avoid stereotypical Nigeria imagery. The Nigerian context should be expressed through the product problem — USD billing, Naira budgeting, FX context — not visual clichés.
8. Keep CTA labels action-specific.
9. Use the same terminology across homepage, dashboard, costs, and optimization pages.
10. The homepage should explain the product before asking the visitor to sign up.
