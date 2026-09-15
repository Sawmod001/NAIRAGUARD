import { AppError } from "./app-error";
import { ErrorCode } from "./codes";

/**
 * Error Handler — NG-005
 * - Never leaks secrets / stack / raw provider payloads to client
 * - Maps unknown throws to AppError
 * - Safe serialization for API / Server Action boundaries
 */

// Keys that must never be serialized (docs/10_SECURITY.md)
const SENSITIVE_KEYS = new Set(["apiKey", "api_key", "secret", "token", "password", "awsSecret", "DATABASE_URL"]);

function stripSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripSensitive);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k)) out[k] = "[REDACTED]";
    else out[k] = typeof v === "object" && v !== null ? stripSensitive(v) : v;
  }
  return out;
}

/** Normalize any throw to AppError (operational). */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    // Zod / Prisma etc will be mapped to validation/internal without leaking internals
    const msg = error.message ?? "Something went wrong.";
    // Heuristic: validation errors often contain "validation" / "ZodError"
    if (error.name === "ZodError" || msg.toLowerCase().includes("validation")) {
      return new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Request validation failed.",
        details: stripSensitive((error as unknown as { issues?: unknown }).issues ?? undefined),
        cause: error,
      });
    }
    return new AppError({ code: ErrorCode.INTERNAL, message: "Something went wrong.", cause: error });
  }
  return new AppError({ code: ErrorCode.INTERNAL, message: "Something went wrong.", cause: error });
}

/** Safe response — for Next.js route handlers / server actions. */
export function toErrorResponse(error: unknown): ReturnType<AppError["toJSON"]> & { requestId?: string } {
  const appErr = toAppError(error);
  return appErr.toJSON();
}

/** Provider failure helpers — consistent per docs/17. */
export function providerUnavailable(cause?: unknown, message?: string): AppError {
  return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, cause, ...(message ? { message } : {}) });
}
export function providerThrottled(cause?: unknown): AppError {
  return new AppError({ code: ErrorCode.PROVIDER_THROTTLED, cause });
}
export function providerTimeout(cause?: unknown): AppError {
  return new AppError({ code: ErrorCode.PROVIDER_TIMEOUT, cause });
}
export function fxUnavailable(cause?: unknown): AppError {
  return new AppError({ code: ErrorCode.FX_UNAVAILABLE, cause });
}
export function aiUnavailable(cause?: unknown): AppError {
  return new AppError({ code: ErrorCode.AI_UNAVAILABLE, cause });
}
export function dbFailure(cause?: unknown): AppError {
  return new AppError({ code: ErrorCode.DB_FAILURE, cause });
}
