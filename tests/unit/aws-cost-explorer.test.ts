import { describe, expect, it } from "vitest";
import type { GetCostAndUsageResponse } from "@aws-sdk/client-cost-explorer";
import { mapCostExplorerResponse } from "@/infrastructure/providers/aws/cost-explorer";
import { AppError } from "@/lib/errors/app-error";

/** NG-COST-01: CE pages normalize deterministically; corruption fails loudly. */
describe("cost explorer mapping (NG-COST-01)", () => {
  const query = { organizationId: "org-1", accountId: "123456789012", periodDays: 2 };

  function page(days: { date: string; groups: { keys: string[]; amount: string }[]; total?: string }): GetCostAndUsageResponse {
    return {
      ResultsByTime: [
        {
          TimePeriod: { Start: days.date, End: days.date },
          Total: days.total !== undefined ? { UnblendedCost: { Amount: days.total, Unit: "USD" } } : undefined,
          Groups: days.groups.map((g) => ({
            Keys: g.keys,
            Metrics: { UnblendedCost: { Amount: g.amount, Unit: "USD" } },
          })),
        },
      ],
    };
  }

  it("sums days, services, and regions with shares", () => {
    const pages = [
      page({
        date: "2026-09-14",
        groups: [
          { keys: ["Amazon Elastic Compute Cloud", "eu-west-1"], amount: "30.00" },
          { keys: ["Amazon Relational Database Service", "eu-west-1"], amount: "10.00" },
        ],
      }),
      page({
        date: "2026-09-15",
        groups: [{ keys: ["Amazon Elastic Compute Cloud", "us-east-1"], amount: "20.00" }],
      }),
    ];
    const res = mapCostExplorerResponse(pages, query, 2, "2026-09-16T00:00:00Z");
    expect(res.totalUsd).toBe(60);
    expect(res.daily.map((d) => d.amountUsd)).toEqual([40, 20]);
    expect(res.serviceBreakdown[0]).toMatchObject({ service: "Amazon Elastic Compute Cloud", amountUsd: 50 });
    expect((res.regionBreakdown ?? []).find((r) => r.region === "eu-west-1")).toMatchObject({ amountUsd: 40 });
    expect(res.source).toBe("AWSCostExplorer");
    expect(res.accountId).toBe("123456789012");
  });

  it("treats missing amounts as zero spend", () => {
    const res = mapCostExplorerResponse([page({ date: "2026-09-15", groups: [] })], query, 1, "2026-09-16T00:00:00Z");
    expect(res.totalUsd).toBe(0);
    expect(res.daily).toHaveLength(1);
  });

  it("rejects corrupt amounts instead of lying in totals", () => {
    const bad: GetCostAndUsageResponse = {
      ResultsByTime: [
        {
          TimePeriod: { Start: "2026-09-15", End: "2026-09-15" },
          Groups: [{ Keys: ["EC2", "eu-west-1"], Metrics: { UnblendedCost: { Amount: "not-a-number", Unit: "USD" } } }],
        },
      ],
    };
    expect(() => mapCostExplorerResponse([bad], query, 1, "2026-09-16T00:00:00Z")).toThrow(AppError);
  });
});
