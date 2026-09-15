import { z } from "zod";

/**
 * Common reusable schemas — NG-006 Validation Foundation
 * Per docs/12_CODING_STANDARDS + docs/20_AI_CODING_AGENT_RULES
 * Validate external/user input BEFORE business logic. Keep schemas DRY.
 */

// --- Primitives ---
export const nonEmptyString = z.string().trim().min(1, "Required");
export const cuidSchema = z.string().cuid();
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().trim().email("Invalid email");
export const isoDateString = z.string().datetime({ offset: true }).or(z.string().date());

// --- Numbers / Money (docs/12: avoid floating errors; keep as Decimal-string + zod refine where needed) ---
export const positiveNumber = z.number().positive("Must be positive");
export const nonNegativeNumber = z.number().nonnegative("Must be non-negative");
export const percentageSchema = z.number().min(0).max(100);
export const usdAmountSchema = z.number().nonnegative();
export const fxRateSchema = z.number().positive();

// --- Pagination (reused across lists: costs, optimizations) ---
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// --- Sort / Filter helpers ---
export const sortOrderSchema = z.enum(["asc", "desc"]);
export const dateRangeSchema = z
  .object({
    from: isoDateString.optional(),
    to: isoDateString.optional(),
  })
  .refine((v) => !v.from || !v.to || new Date(v.from) <= new Date(v.to), {
    message: "from must be <= to",
    path: ["from"],
  });

// --- Generic utilities ---
export function requiredStringField(name: string): z.ZodString {
  return z.string().trim().min(1, `${name} is required`);
}
