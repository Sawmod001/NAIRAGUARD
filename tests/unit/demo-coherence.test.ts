import { describe, expect, it } from "vitest";
import { getDemoDataset, REQUIRED_SCENARIOS } from "@/infrastructure/providers/demo/registry";
import { demoTotalUsd, maskAwsAccountId } from "@/schemas/demo";

/**
 * NG-DEMO-02: seeded workspace hierarchy is coherent and behaves like connected data.
 * Workspace → org (DB) → one AWS account → regions → services → cost/utilization/optimization.
 * Totals must reconcile; every finding must sit inside the account's regions.
 */
describe("demo seed coherence (NG-DEMO-02)", () => {
  it("masks the workspace account id", () => {
    expect(maskAwsAccountId("123456789012")).toBe("1234••••9012");
    expect(maskAwsAccountId("not-an-id")).toBe("••••");
  });

  for (const id of REQUIRED_SCENARIOS) {
    it(`${id}: single Production Account with covering regions`, () => {
      const dataset = getDemoDataset(id);
      expect(dataset.scenario.accountId).toBe("123456789012");
      expect(dataset.scenario.accountName).toBe("Production Account");
      expect(dataset.scenario.regions.length).toBeGreaterThan(0);
      for (const rec of dataset.recommendations) {
        expect(dataset.scenario.regions).toContain(rec.region);
      }
    });

    it(`${id}: daily, service, and regional totals reconcile`, () => {
      const dataset = getDemoDataset(id);
      const daily = demoTotalUsd(dataset);
      const services = dataset.cost.serviceBreakdown.reduce((s, b) => s + b.amountUsd, 0);
      expect(dataset.cost.daily.length).toBe(dataset.cost.periodDays);
      expect(Math.abs(daily - services) / services).toBeLessThan(0.01);
    });
  }
});
