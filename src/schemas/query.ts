import { z } from "zod";

export const periodSchema = z.enum(["7", "30", "90"]).catch("30");
export const scenarioSchema = z.string().min(1).max(64).regex(/^[a-z0-9-]+$/).catch("balanced-startup");
export const dashboardQuerySchema = z.object({
  period: periodSchema.optional(),
  scenario: scenarioSchema.optional(),
});
export const costQuerySchema = z.object({
  period: periodSchema.optional(),
  scenario: scenarioSchema.optional(),
});
export const optimizationQuerySchema = z.object({
  scenario: scenarioSchema.optional(),
  effort: z.enum(["Low", "Medium", "High"]).optional(),
  region: z.string().optional(),
  sort: z.enum(["savings", "percentage", "effort"]).optional(),
});
