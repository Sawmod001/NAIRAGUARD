/**
 * CostProvider — NG-201
 * Normalized cost contract. Demo + future AWS (Cost Explorer) implement this.
 * Domain never sees AWS SDK types — only these.
 */

export type CostQuery = {
  organizationId: string;
  accountId?: string | null;
  periodDays?: number; // default 30
  from?: string; // ISO
  to?: string; // ISO
};

export type CostDailyPoint = {
  date: string; // YYYY-MM-DD UTC
  amountUsd: number;
};

export type CostServiceBreakdown = {
  service: string; // e.g. "Amazon Elastic Compute Cloud"
  amountUsd: number;
  percentage: number;
};

export type CostRegionBreakdown = {
  region: string; // e.g. "eu-west-1"
  amountUsd: number;
  percentage: number;
};

export type CostResult = {
  organizationId: string;
  accountId: string | null;
  currency: "USD";
  periodDays: number;
  totalUsd: number;
  daily: CostDailyPoint[];
  serviceBreakdown: CostServiceBreakdown[];
  regionBreakdown?: CostRegionBreakdown[];
  source: string; // e.g. "DemoCostProvider" | "AWSCostProvider"
  observedAt: string; // ISO
};

export interface CostProvider {
  getCosts(query: CostQuery): Promise<CostResult>;
}
