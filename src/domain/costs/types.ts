/**
 * Domain Cost Types — NG-301
 * Provider-agnostic, explicit currency/timestamps, relationships clear per docs/03.
 * Provider's CostResult never leaks into domain — this is the normalized shape.
 */

export type DomainCurrency = "USD";

export type DomainCostDaily = {
  date: string; // YYYY-MM-DD UTC
  amount: number; // USD dollars (derived, 2 decimals) — for display
  amountCents: number; // USD cents authoritative integer (02-ARCH: money as cents)
  currency: DomainCurrency;
};

export type DomainCostService = {
  service: string; // e.g. "Amazon Elastic Compute Cloud"
  amount: number; // USD dollars
  amountCents: number; // USD cents
  currency: DomainCurrency;
  percentage: number;
};

export type DomainCostRegion = {
  region: string;
  amount: number; // USD dollars
  amountCents: number; // USD cents
  currency: DomainCurrency;
  percentage: number;
};

export type DomainCost = {
  organizationId: string;
  accountId: string | null;
  currency: DomainCurrency;
  periodDays: number;
  total: number; // USD dollars sum
  totalCents: number; // USD cents authoritative
  daily: DomainCostDaily[];
  services: DomainCostService[];
  regions: DomainCostRegion[];
  observedAt: string; // ISO — explicit freshness (docs/07:8)
  source: string;
};
