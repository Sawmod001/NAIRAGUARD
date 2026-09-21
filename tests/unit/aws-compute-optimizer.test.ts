import { describe, expect, it } from "vitest";
import type {
  InstanceRecommendation,
  LambdaFunctionRecommendation,
  RDSDBRecommendation,
  VolumeRecommendation,
} from "@aws-sdk/client-compute-optimizer";
import { mapComputeOptimizerRecommendations } from "@/infrastructure/providers/aws/compute-optimizer";

/** NG-OPT-02: per-type evidence normalizes; weak items are skipped, never invented. */
describe("compute optimizer mapping (NG-OPT-02)", () => {
  const query = { organizationId: "org-1" };
  const stamp = "2026-09-16T00:00:00.000Z";

  const ec2: InstanceRecommendation = {
    instanceArn: "arn:aws:ec2:eu-west-1:123456789012:instance/i-0abc",
    accountId: "123456789012",
    currentInstanceType: "m6i.2xlarge",
    finding: "Overprovisioned",
    recommendationOptions: [
      {
        instanceType: "m6i.xlarge",
        savingsOpportunity: { estimatedMonthlySavings: { currency: "USD", value: 118.7 }, savingsOpportunityPercentage: 41.4 },
      },
    ],
    lastRefreshTimestamp: new Date("2026-09-15T00:00:00.000Z"),
  };
  const ebs: VolumeRecommendation = {
    volumeArn: "arn:aws:ec2:eu-west-1:123456789012:volume/vol-0abc",
    accountId: "123456789012",
    currentConfiguration: { volumeType: "gp3", volumeSize: 500 },
    finding: "NotOptimized",
    volumeRecommendationOptions: [
      {
        configuration: { volumeType: "gp3", volumeSize: 250 },
        savingsOpportunity: { estimatedMonthlySavings: { currency: "USD", value: 20 } },
      },
    ],
    lastRefreshTimestamp: new Date("2026-09-15T00:00:00.000Z"),
  };
  const lambda: LambdaFunctionRecommendation = {
    functionArn: "arn:aws:lambda:us-east-1:123456789012:function:worker",
    accountId: "123456789012",
    currentMemorySize: 1024,
    finding: "NotOptimized",
    memorySizeRecommendationOptions: [
      { memorySize: 512, savingsOpportunity: { estimatedMonthlySavings: { currency: "USD", value: 3.2 } } },
    ],
    lastRefreshTimestamp: new Date("2026-09-15T00:00:00.000Z"),
  };
  const rds: RDSDBRecommendation = {
    resourceArn: "arn:aws:rds:eu-west-1:123456789012:db:orders",
    accountId: "123456789012",
    engine: "postgres",
    engineVersion: "15.4",
    instanceFinding: "Overprovisioned",
    instanceRecommendationOptions: [
      { dbInstanceClass: "db.t3.medium", savingsOpportunity: { estimatedMonthlySavings: { currency: "USD", value: 41.1 } } },
    ],
    lastRefreshTimestamp: new Date("2026-09-15T00:00:00.000Z"),
  };

  it("maps all four evidence types with stable ids", () => {
    const mapped = mapComputeOptimizerRecommendations({ ec2: [ec2], ebs: [ebs], lambda: [lambda], rds: [rds] }, query, stamp);
    expect(mapped).toHaveLength(4);
    for (const r of mapped) {
      expect(r.source).toBe("AWS Compute Optimizer");
      expect(r.status).toBe("open");
      expect(r.effort).toBe("Low");
    }
    const byType = Object.fromEntries(mapped.map((r) => [r.resourceType, r]));
    expect(byType.Ec2Instance).toMatchObject({
      externalId: "co-ec2-i-0abc",
      resourceId: "i-0abc",
      region: "eu-west-1",
      actionType: "Rightsize",
      currentConfiguration: "m6i.2xlarge",
      recommendedConfiguration: "m6i.xlarge",
      estimatedMonthlySavingsUsd: 118.7,
      savingsPercentage: 41.4,
      restartRequired: true,
    });
    expect(byType.EbsVolume).toMatchObject({
      externalId: "co-ebs-vol-0abc",
      actionType: "Optimize storage",
      currentConfiguration: "gp3 500 GiB",
      recommendedConfiguration: "gp3 250 GiB",
      restartRequired: false,
    });
    expect(byType.LambdaFunction).toMatchObject({
      externalId: "co-lambda-worker",
      region: "us-east-1",
      actionType: "Optimize memory",
      currentConfiguration: "1024 MB",
      recommendedConfiguration: "512 MB",
    });
    expect(byType.RdsInstance).toMatchObject({
      externalId: "co-rds-orders",
      resourceId: "orders",
      actionType: "Rightsize",
      recommendedConfiguration: "db.t3.medium",
    });
  });

  it("skips items without identity or positive savings", () => {
    const noSavings: InstanceRecommendation = { ...ec2, recommendationOptions: [] };
    const noArn: InstanceRecommendation = { ...ec2, instanceArn: undefined };
    const zero: InstanceRecommendation = {
      ...ec2,
      recommendationOptions: [
        { instanceType: "m6i.xlarge", savingsOpportunity: { estimatedMonthlySavings: { currency: "USD", value: 0 } } },
      ],
    };
    const mapped = mapComputeOptimizerRecommendations(
      { ec2: [noSavings, noArn, zero], ebs: [], lambda: [], rds: [] },
      query,
      stamp
    );
    expect(mapped).toHaveLength(0);
  });

  it("filters by service like demo and hub", () => {
    const mapped = mapComputeOptimizerRecommendations(
      { ec2: [ec2], ebs: [ebs], lambda: [lambda], rds: [rds] },
      { ...query, service: "ebs" },
      stamp
    );
    expect(mapped.map((r) => r.resourceType)).toEqual(["EbsVolume"]);
  });
});
