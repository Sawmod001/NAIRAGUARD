# FX Specification

## Purpose

Convert AWS USD values into an estimated Naira equivalent.

## MVP requirement

USD/NGN only.

## Provider strategy

Use an FX provider adapter.

Demo Mode:
- deterministic fixture rate for tests/scenarios

Live Mode:
- external FX provider

A practical free option for experimentation is ExchangeRate.fun, which currently advertises no-key access, 160+ currencies, hourly updates, and a USD-based endpoint. Another option is currencyapi.com, whose free plan currently offers 300 requests/month and daily updates. Provider terms/limits should be rechecked before production. citeturn1search10turn1search0

## Caching

Do not call an FX API for every component render.

Fetch/cache at the service boundary.

Store:
- provider
- rate
- observedAt
- expiresAt

## Fallback

If live FX provider fails:

1. use cached non-expired rate
2. if unavailable, use last-known rate with explicit stale warning
3. if no rate exists, do not fabricate one
4. allow Demo Mode fixture rate

## Display language

Always use “estimated Naira equivalent.”

Never imply that this is the user's exact bank settlement amount.
