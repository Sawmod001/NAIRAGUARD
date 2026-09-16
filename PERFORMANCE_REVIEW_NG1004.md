# NG-1004 Performance Review

**Date:** 2026-09-16
**Build:** Next 16.3.5 Turbopack, 10 routes, ~623KB chunks

## Checklist

- [x] **Provider calls:** Demo providers `fs` read + `zod` parse, no network; `LiveFXProvider` fetch `no-store` at service boundary, not per render
- [x] **Caching:** `CachedFXProvider` 1h TTL, `getRate` cached, stale fallback to `demo-fixture`, `USD` never blocked; `DemoCostProvider` in-memory, no repeated `fs` beyond per-request (acceptable for Demo, future AWS will need DB snapshot)
- [x] **DB queries:** `prisma.membership.findFirst` + `user.findUnique` per request, indexed `@@unique([userId, organizationId])` + `@index`, no N+1, `HealthCheck` only
- [x] **Client bundle:** No `Three.js`/`GSAP`/`framer-motion`, only `next`, `react`, `zod`, `bcryptjs` (server), `next-auth` (server), Tailwind; `~623KB` chunks, no large chart lib (div bars)
- [x] **Charts:** Simple `div` bars (`cost-trend`, `cost-drivers`), not `recharts`/`chart.js`, fast, no canvas
- [x] **Homepage:** `Hero` gradient + `pulse` only, `prefers-reduced-motion` disables, `Story` static, `InteractiveViz` `useState` + `input range` only, no `Three.js`
- [x] **AI calls:** `MockAIProvider` deterministic, no network, `isAvailable` true, failure → amber fallback, no repeated calls
- [x] **FX calls:** `DemoFXProvider` fixture `1550`, `LiveFXProvider` server-only, `Cached` prevents per-render, `NairaEquivalentCard` shows `observedAt` + stale badge

## Cost Awareness (Future AWS)
- `Cost Explorer` will be cached via `CostSnapshot` + `prisma` + background sync, not per page render (docs/17)

## Verdict
**PASS** — no regressions, `build` 7.6s, no unnecessary network per render.
