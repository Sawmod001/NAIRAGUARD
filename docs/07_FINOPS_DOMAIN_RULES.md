# FinOps Domain Rules

## 1. Source of truth hierarchy

1. Provider data
2. Deterministic NairaGuard calculations
3. AI interpretation

Never reverse this order.

## 2. Savings

If a provider reports:

`estimatedMonthlySavingsUsd = 120`

and FX rate is:

`USDNGN = 1,550`

then:

`estimatedMonthlySavingsNgn = 120 × 1,550 = ₦186,000`

The AI must not change the $120.

## 3. Total potential savings

Do not blindly sum recommendations if the source marks recommendations as mutually exclusive or if AWS already aggregates/deduplicates them.

AWS Cost Optimization Hub aggregates and deduplicates related savings opportunities. NairaGuard should preserve source semantics rather than inventing a new total. citeturn0search0turn0search1

## 4. Cost efficiency

A future efficiency score may combine:
- savings opportunity
- idle resource exposure
- spend trend
- recommendation coverage
- resource utilization

Do not invent an arbitrary score in MVP unless the scoring formula is documented and deterministic.

## 5. Recommendation priority

Priority should consider evidence, not only savings.

Conceptual factors:
- savings impact
- implementation effort
- performance risk
- restart requirement
- rollback possibility
- confidence/evidence quality

## 6. Actual vs potential vs realized

The UI must distinguish:

- Current spend
- Estimated monthly cost
- Potential savings
- Realized savings

MVP only needs current spend and potential savings.

## 7. Naira presentation

Always display:
- USD source value
- NGN estimate
- FX rate
- FX timestamp/provider

Avoid:
> Your AWS bill is ₦4,200,000.

Prefer:
> Estimated Naira equivalent: ₦4,200,000 at ₦1,550/USD.

## 8. Data freshness

A financial dashboard must show when data was last synchronized.

Example:

> Cost data synced 2 hours ago

Do not label delayed billing data as real-time.
