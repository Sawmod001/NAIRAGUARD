import { z } from "zod";

/**
 * Demo Dataset Schema — NG-202
 * Zod-normalized, aligns with provider contracts (NG-201) + docs/06_DEMO_DATA_SPEC
 * Supports future dashboard calcs: total, daily trend, service breakdown, savings.
 * Realistic AWS-like, not UI fake values.
 */

// --- Scenario meta ---
export const demoScenarioMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  accountId: z.string().regex(/^\d{12}$/, "12-digit AWS account"),
});

// --- Cost ---
export const demoDailySchema = z.object({
  dateOffset: z.number().int(),
  amountUsd: z.number().nonnegative(),
});

export const demoServiceBreakdownSchema = z.object({
  service: z.string().min(1),
  amountUsd: z.number().nonnegative(),
  percentage: z.number().min(0).max(100),
});

export const demoCostSchema = z
  .object({
    periodDays: z.number().int().min(1).max(90),
    daily: z.array(demoDailySchema).min(1),
    serviceBreakdown: z.array(demoServiceBreakdownSchema).min(1),
  })
  .superRefine((val, ctx) => {
    const pctSum = val.serviceBreakdown.reduce((s, b) => s + b.percentage, 0);
    if (Math.abs(pctSum - 100) > 0.5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `serviceBreakdown percentages sum ${pctSum} != 100`, path: ["serviceBreakdown"] });
    }
    if (val.daily.length !== val.periodDays) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `daily length ${val.daily.length} != periodDays ${val.periodDays}`, path: ["daily"] });
    }
  });

// --- FX (demo fixture, docs/09) ---
export const demoFxSchema = z.object({
  usdNgn: z.number().positive(),
  provider: z.string().min(1),
  observedAt: z.string().datetime({ offset: true }),
});

// --- Recommendation (maps to NormalizedRecommendation) ---
export const demoRecommendationSchema = z.object({
  externalId: z.string().min(1),
  source: z.string().min(1), // e.g. "AWS Cost Optimization Hub"
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  region: z.string().min(1),
  actionType: z.string().min(1),
  currentConfiguration: z.string().min(1),
  recommendedConfiguration: z.string().min(1),
  estimatedMonthlyCostUsd: z.number().nonnegative(),
  estimatedMonthlySavingsUsd: z.number().nonnegative(),
  savingsPercentage: z.number().min(0).max(100).nullable().optional(),
  effort: z.enum(["Low", "Medium", "High"]),
  restartRequired: z.boolean(),
  rollbackPossible: z.boolean(),
});

// --- Full dataset per scenario file ---
export const demoDatasetSchema = z
  .object({
    scenario: demoScenarioMetaSchema,
    cost: demoCostSchema,
    fx: demoFxSchema,
    recommendations: z.array(demoRecommendationSchema),
  })
  .superRefine((val, ctx) => {
    // Ensure savings <= cost where applicable (realistic)
    for (const r of val.recommendations) {
      if (r.estimatedMonthlySavingsUsd > r.estimatedMonthlyCostUsd + 0.01) {
        // Savings can equal cost for idle delete, but not exceed significantly
        if (r.estimatedMonthlySavingsUsd > r.estimatedMonthlyCostUsd * 1.01) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `savings ${r.estimatedMonthlySavingsUsd} > cost ${r.estimatedMonthlyCostUsd} for ${r.externalId}`, path: ["recommendations"] });
        }
      }
    }
  });

export type DemoDataset = z.infer<typeof demoDatasetSchema>;
export type DemoCost = z.infer<typeof demoCostSchema>;
export type DemoRecommendation = z.infer<typeof demoRecommendationSchema>;

// --- Helpers for dashboard calcs ---
export function demoTotalUsd(dataset: DemoDataset): number {
  return dataset.cost.daily.reduce((s, d) => s + d.amountUsd, 0);
}
export function demoPotentialSavingsUsd(dataset: DemoDataset): number {
  return dataset.recommendations.reduce((s, r) => s + r.estimatedMonthlySavingsUsd, 0);
}
