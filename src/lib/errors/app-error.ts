import { ErrorCategory, ErrorCode, ERROR_STATUS, ERROR_RETRYABLE, getCategoryForCode } from "./codes";

/**
 * AppError — NG-005 Foundation
 * Predictable, safe error that can cross Server Action / API boundaries.
 * - `message` is user-safe (no secrets, no stack)
 * - `cause` is internal only, never serialized to client
 * - `details` is safe structured context (e.g. zod issues) — optional
 */

export type AppErrorOptions = {
  code?: ErrorCode;
  status?: number;
  category?: ErrorCategory;
  message?: string;
  details?: unknown;
  cause?: unknown;
  retryable?: boolean;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly category: ErrorCategory;
  readonly details?: unknown;
  readonly isOperational = true;
  readonly retryable: boolean;

  constructor(opts: AppErrorOptions = {}) {
    const code = opts.code ?? ErrorCode.INTERNAL;
    const status = opts.status ?? ERROR_STATUS[code] ?? 500;
    const category = opts.category ?? getCategoryForCode(code);
    const message = opts.message ?? defaultMessageForCode(code);
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.category = category;
    this.details = opts.details;
    this.cause = opts.cause;
    this.retryable = opts.retryable ?? ERROR_RETRYABLE[code] ?? false;
  }

  /** Safe payload for client/API — never includes cause/stack/secrets. */
  toJSON(): { code: ErrorCode; status: number; category: ErrorCategory; message: string; details?: unknown; retryable: boolean } {
    return {
      code: this.code,
      status: this.status,
      category: this.category,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
      retryable: this.retryable,
    };
  }

  /** Alias for Next.js / API serialization. */
  toResponse(): ReturnType<AppError["toJSON"]> {
    return this.toJSON();
  }
}

function defaultMessageForCode(code: ErrorCode): string {
  const map: Record<ErrorCode, string> = {
    VALIDATION_FAILED: "Request validation failed. Check your input.",
    INVALID_INPUT: "Invalid input.",
    UNAUTHENTICATED: "You must sign in to continue.",
    UNAUTHORIZED: "You do not have access to this resource.",
    TENANT_FORBIDDEN: "You do not have access to this organization.",
    NOT_FOUND: "Resource not found.",
    PROVIDER_UNAVAILABLE: "Data provider is temporarily unavailable. Try again.",
    PROVIDER_THROTTLED: "Data provider is throttled. Try again shortly.",
    PROVIDER_TIMEOUT: "Data provider timed out. Try again.",
    PROVIDER_MALFORMED_RESPONSE: "Received unexpected data from provider.",
    PROVIDER_STALE_DATA: "Data may be stale.",
    AWS_ACCESS_DENIED: "AWS access denied. Check IAM role and external ID.",
    AWS_ROLE_INVALID: "AWS role is invalid or cannot be assumed.",
    AWS_ACCOUNT_UNAVAILABLE: "AWS account is unavailable.",
    AWS_THROTTLED: "AWS is throttling requests. Try again.",
    AWS_SERVICE_UNAVAILABLE: "AWS service is temporarily unavailable.",
    AWS_NO_DATA: "No AWS data available.",
    AWS_FEATURE_NOT_ENABLED: "AWS feature not enabled for this account.",
    AWS_RECOMMENDATIONS_NOT_READY: "AWS recommendations are not ready yet.",
    FX_UNAVAILABLE: "FX rate unavailable. Showing USD only.",
    FX_STALE: "FX rate may be stale.",
    AI_UNAVAILABLE: "AI explanation unavailable. Your data is still visible.",
    AI_MALFORMED: "AI returned an unexpected format.",
    AI_TIMEOUT: "AI explanation timed out.",
    AI_RATE_LIMITED: "AI is rate limited. Try again.",
    DB_FAILURE: "Database temporarily unavailable.",
    INTERNAL: "Something went wrong. Try again.",
  };
  return map[code] ?? "Something went wrong.";
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
