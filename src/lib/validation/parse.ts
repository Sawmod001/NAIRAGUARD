import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * Validation boundary — NG-006
 * Reusable Zod helpers that:
 * - Validate BEFORE business logic
 * - Throw AppError (safe, serializable) on failure — never raw ZodError to client
 * - Preserve field-level details for UI
 */

export type ParseResult<T> = { success: true; data: T } | { success: false; error: AppError };

/** Format Zod issues to safe, user-understandable shape. */
export function formatZodIssues(error: z.ZodError): { field: string; message: string }[] {
  return error.issues.map((i) => ({
    field: i.path.join(".") || "(root)",
    message: i.message,
  }));
}

/** Parse or throw AppError — use at service/handler entry. */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown, message = "Validation failed"): T {
  const res = schema.safeParse(data);
  if (res.success) return res.data;
  throw new AppError({
    code: ErrorCode.VALIDATION_FAILED,
    message,
    details: formatZodIssues(res.error),
    cause: res.error,
  });
}

/** Safe parse — returns AppError instead of throwing. */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): ParseResult<T> {
  const res = schema.safeParse(data);
  if (res.success) return { success: true, data: res.data };
  return {
    success: false,
    error: new AppError({
      code: ErrorCode.VALIDATION_FAILED,
      message: "Validation failed",
      details: formatZodIssues(res.error),
      cause: res.error,
    }),
  };
}

/** Validate query string / FormData helpers */
export function parseQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const obj: Record<string, string> = {};
  for (const [k, v] of searchParams.entries()) obj[k] = v;
  return parseOrThrow(schema, obj, "Invalid query parameters");
}

export function parseFormData<T>(schema: z.ZodSchema<T>, formData: FormData): T {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) obj[k] = v;
  return parseOrThrow(schema, obj, "Invalid form data");
}
