# User Flows

## Flow A — Landing page

Visitor → Homepage → Understand product → Sign up / Sign in

The homepage is intentionally more creative than the application dashboard.

## Flow B — Sign up

Sign up → authentication provider → account created → onboarding → dashboard

## Flow C — Demo onboarding

Sign in → Choose Demo Mode → choose demo scenario → dashboard

Demo scenarios should make the product feel like a real system rather than a static portfolio page.

Recommended scenarios:

1. **Balanced Startup**
2. **Waste-Heavy Startup**
3. **EC2-Heavy Startup**
4. **Storage-Heavy Startup**
5. **FX Pressure Scenario**

The user should be able to switch scenarios without changing application architecture.

## Flow D — Dashboard

Dashboard → inspect total spend → inspect cost trend → inspect service distribution → inspect savings opportunity summary → open recommendation.

## Flow E — Recommendation

Recommendation list → recommendation detail → evidence → financial impact → Naira impact → AI explanation → recommended next investigation.

## Flow F — Future Live AWS

Dashboard → Connect AWS → IAM role setup → verification → synchronization → same dashboard/domain engine.

The live provider must produce the same domain contracts used by Demo Mode.

## Empty/error flows

The product must deliberately support:

- no cost data
- no recommendations
- AWS access denied
- AWS role missing
- AWS throttling
- provider unavailable
- FX provider unavailable
- AI provider unavailable
- stale data
- database unavailable
- invalid organization/account access
