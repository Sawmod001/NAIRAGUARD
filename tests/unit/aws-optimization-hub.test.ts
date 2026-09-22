import { describe, expect, it } from "vitest";
import type { Recommendation } from "@aws-sdk/client-cost-optimization-hub";
import { mapHubRecommendations } from "@/infrastructure/providers/aws/optimization-hub";

/** NG-OPT-01: Hub items normalize faithfully; weak items are skipped, never invented. */
describe("optimization hub mapping (NG-OPT-01)", () => {
  const query = { organizationId: "org-1" };

  function item(over: Partial<Recommendation> = {}): Recommendation {
    return {
      recommendationId: "rec-1",
      resourceId: "i-0123456789abcdef0",
      resourceArn: "arn:aws:ec2:eu-west-1:123456789012:instance/i-0123456789abcdef0",
      region: "eu-west-1",
      currentResourceType: "Ec2Instance",
      actionType: "Rightsize",
      currentResourceSummary: "m6i.2xlarge",
      recommendedResourceSummary: "m6i.xlarge",
      estimatedMonthlyCost: 286.4,
      estimatedMonthlySavings: 118.7,
      estimatedSavingsPercentage: 41.45,
      implementationEffort: "Low",
      restartNeeded: true,
      rollbackPossible: true,
      lastRefreshTimestamp: new Date("2026-09-15T00:00:00.000Z"),
      ...over,
    };
  }

  it("maps a full Hub item onto the contract", () => {
    const [rec] = mapHubRecommendations([item()], query, "2026-09-16T00:00:00.000Z");
    expect(rec).toMatchObject({
      externalId: "rec-1",
      source: "AWS Cost Optimization Hub",
      resourceType: "Ec2Instance",
      resourceId: "i-0123456789abcdef0",
      region: "eu-west-1",
      actionType: "Rightsize",
      currentConfiguration: "m6i.2xlarge",
      recommendedConfiguration: "m6i.xlarge",
      estimatedMonthlyCostUsd: 286.4,
      estimatedMonthlySavingsUsd: 118.7,
      savingsPercentage: 41.45,
      effort: "Low",
      restartRequired: true,
      rollbackPossible: true,
      status: "open",
      observedAt: "2026-09-15T00:00:00.000Z",
    });
  });

  it("skips negative-cost evidence as malformed (NG-SEC-04)", () => {
    const mapped = mapHubRecommendations(
      [item({ recommendationId: "bad-cost", estimatedMonthlyCost: -50, estimatedMonthlySavings: 10 })],
      query,
      "2026-09-16T00:00:00.000Z"
    );
    expect(mapped).toHaveLength(0);
  });

  it("skips items without id or positive savings instead of inventing them", () => {
    const items = [
      item({ recommendationId: undefined }),
      item({ recommendationId: "no-save", estimatedMonthlySavings: undefined }),
      item({ recommendationId: "zero-save", estimatedMonthlySavings: 0 }),
      item({ recommendationId: "good", estimatedMonthlySavings: 5 }),
    ];
    const mapped = mapHubRecommendations(items, query, "2026-09-16T00:00:00.000Z");
    expect(mapped.map((r) => r.externalId)).toEqual(["good"]);
  });

  it("grades effort and falls back safely", () => {
    expect(mapHubRecommendations([item({ implementationEffort: "VeryHigh" })], query, "")[0]!.effort).toBe("High");
    expect(mapHubRecommendations([item({ implementationEffort: "VeryLow" })], query, "")[0]!.effort).toBe("Low");
    expect(mapHubRecommendations([item({ implementationEffort: undefined })], query, "")[0]!.effort).toBe("Medium");
  });

  it("derives resource id from ARN and filters by service like demo", () => {
    const [rec] = mapHubRecommendations(
      [item({ resourceId: undefined, resourceArn: "arn:aws:ec2:eu-west-1:123456789012:instance/i-0abc" })],
      query,
      ""
    );
    expect(rec!.resourceId).toBe("i-0abc");
    const filtered = mapHubRecommendations([item(), item({ recommendationId: "rec-2", currentResourceType: "EbsVolume" })], { ...query, service: "ec2" }, "");
    expect(filtered.map((r) => r.externalId)).toEqual(["rec-1"]);
  });
});
