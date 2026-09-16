import { z } from "zod";

/**
 * AI Explanation Schema — NG-605 Structured, Zod-validated, graceful failure
 * AI never calculates savings — explains evidence per docs/08.
 */

export const aiExplanationSchema = z.object({
  summary: z.string().min(10),
  whyItMatters: z.string().min(10),
  recommendedNextStep: z.string().min(10),
  businessImpact: z.string().min(10),
  technicalImpact: z.string().min(10),
  risks: z.array(z.string()).min(1),
  priority: z.enum(["low", "medium", "high"]),
  confidence: z.enum(["low", "medium", "high"]),
  assumptions: z.array(z.string()),
});

export type AIExplanation = z.infer<typeof aiExplanationSchema>;
