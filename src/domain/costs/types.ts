/**
 * Domain Cost Types — NG-301
 * Provider-agnostic, explicit currency/timestamps, relationships clear per docs/03.
 * Provider's CostResult never leaks into domain — this is the normalized shape.
 */

export type DomainCurrency = "USD";

export type DomainCostDaily = {
  date: string; // YYYY-MM-DD UTC
  amount: number; // USD
  currency: DomainCurrency;
};

export type DomainCostService = {
  service: string; // e.g. "Amazon Elastic Compute Cloud"
  amount: number; // USD
  currency: DomainCurrency;
  percentage: number;
};

export type DomainCostRegion = {
  region: string;
  amount: number;
  currency: DomainCurrency;
  percentage: number;
};

export type DomainCost = {
  organizationId: string;
  accountId: string | null;
  currency: DomainCurrency;
  periodDays: number;
  total: number; // USD sum of daily
  daily: DomainCostDaily[];
  services: DomainCostService[];
  regions: DomainCostRegion[];
  observedAt: string; // ISO — explicit freshness (docs/07:8)
  source: string;
};
