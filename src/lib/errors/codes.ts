/**
 * NairaGuard Error Codes — NG-005
 * Consistent codes per docs/10_SECURITY + docs/17_LIVE_AWS_LATER
 * Categories map to HTTP status and retry semantics.
 */

export const ErrorCategory = {
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  NOT_FOUND: "not_found",
  PROVIDER: "provider",
  SYSTEM: "system",
} as const;

export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

/** Stable application error codes — never change without migration. */
export const ErrorCode = {
  // Validation (400)
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",

  // Auth (401/403)
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  TENANT_FORBIDDEN: "TENANT_FORBIDDEN",

  // Not found (404)
  NOT_FOUND: "NOT_FOUND",

  // Provider — Demo/Live unified (502/503/504)
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  PROVIDER_THROTTLED: "PROVIDER_THROTTLED",
  PROVIDER_TIMEOUT: "PROVIDER_TIMEOUT",
  PROVIDER_MALFORMED_RESPONSE: "PROVIDER_MALFORMED_RESPONSE",
  PROVIDER_STALE_DATA: "PROVIDER_STALE_DATA",

  // AWS-specific (future Live mode, docs/17)
  AWS_ACCESS_DENIED: "AWS_ACCESS_DENIED",
  AWS_ROLE_INVALID: "AWS_ROLE_INVALID",
  AWS_ACCOUNT_UNAVAILABLE: "AWS_ACCOUNT_UNAVAILABLE",
  AWS_THROTTLED: "AWS_THROTTLED",
  AWS_SERVICE_UNAVAILABLE: "AWS_SERVICE_UNAVAILABLE",
  AWS_NO_DATA: "AWS_NO_DATA",
  AWS_FEATURE_NOT_ENABLED: "AWS_FEATURE_NOT_ENABLED",
  AWS_RECOMMENDATIONS_NOT_READY: "AWS_RECOMMENDATIONS_NOT_READY",

  // FX / AI (also providers)
  FX_UNAVAILABLE: "FX_UNAVAILABLE",
  FX_STALE: "FX_STALE",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  AI_MALFORMED: "AI_MALFORMED",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_RATE_LIMITED: "AI_RATE_LIMITED",

  // DB / System (500)
  DB_FAILURE: "DB_FAILURE",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** HTTP status per code — single source of truth. */
export const ERROR_STATUS: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  INVALID_INPUT: 400,

  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 403,
  TENANT_FORBIDDEN: 403,

  NOT_FOUND: 404,

  PROVIDER_UNAVAILABLE: 502,
  PROVIDER_THROTTLED: 429,
  PROVIDER_TIMEOUT: 504,
  PROVIDER_MALFORMED_RESPONSE: 502,
  PROVIDER_STALE_DATA: 200, // Degraded success — caller decides

  AWS_ACCESS_DENIED: 403,
  AWS_ROLE_INVALID: 403,
  AWS_ACCOUNT_UNAVAILABLE: 502,
  AWS_THROTTLED: 429,
  AWS_SERVICE_UNAVAILABLE: 502,
  AWS_NO_DATA: 404,
  AWS_FEATURE_NOT_ENABLED: 400,
  AWS_RECOMMENDATIONS_NOT_READY: 202,

  FX_UNAVAILABLE: 502,
  FX_STALE: 200,
  AI_UNAVAILABLE: 502,
  AI_MALFORMED: 502,
  AI_TIMEOUT: 504,
  AI_RATE_LIMITED: 429,

  DB_FAILURE: 500,
  INTERNAL: 500,
};

/** Whether error is retryable / transient. */
export const ERROR_RETRYABLE: Record<ErrorCode, boolean> = {
  VALIDATION_FAILED: false,
  INVALID_INPUT: false,
  UNAUTHENTICATED: false,
  UNAUTHORIZED: false,
  TENANT_FORBIDDEN: false,
  NOT_FOUND: false,
  PROVIDER_UNAVAILABLE: true,
  PROVIDER_THROTTLED: true,
  PROVIDER_TIMEOUT: true,
  PROVIDER_MALFORMED_RESPONSE: false,
  PROVIDER_STALE_DATA: false,
  AWS_ACCESS_DENIED: false,
  AWS_ROLE_INVALID: false,
  AWS_ACCOUNT_UNAVAILABLE: true,
  AWS_THROTTLED: true,
  AWS_SERVICE_UNAVAILABLE: true,
  AWS_NO_DATA: false,
  AWS_FEATURE_NOT_ENABLED: false,
  AWS_RECOMMENDATIONS_NOT_READY: true,
  FX_UNAVAILABLE: true,
  FX_STALE: false,
  AI_UNAVAILABLE: true,
  AI_MALFORMED: false,
  AI_TIMEOUT: true,
  AI_RATE_LIMITED: true,
  DB_FAILURE: true,
  INTERNAL: false,
};

export function getCategoryForCode(code: ErrorCode): ErrorCategory {
  if (code.startsWith("AWS_") || code.startsWith("PROVIDER_") || code.startsWith("FX_") || code.startsWith("AI_"))
    return ErrorCategory.PROVIDER;
  if (code === ErrorCode.VALIDATION_FAILED || code === ErrorCode.INVALID_INPUT) return ErrorCategory.VALIDATION;
  if (code === ErrorCode.UNAUTHENTICATED) return ErrorCategory.AUTHENTICATION;
  if (code === ErrorCode.UNAUTHORIZED || code === ErrorCode.TENANT_FORBIDDEN) return ErrorCategory.AUTHORIZATION;
  if (code === ErrorCode.NOT_FOUND || code === ErrorCode.AWS_NO_DATA) return ErrorCategory.NOT_FOUND;
  return ErrorCategory.SYSTEM;
}
