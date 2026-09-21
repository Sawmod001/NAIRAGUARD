import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { isRetryableSyncError, isThrottledError } from "@/domain/sync/retry";

/**
 * Shared recommendation-adapter plumbing — NG-OPT-02
 * Error mapping, retry, and timeouts used by the Hub and Compute Optimizer
 * adapters so throttling, access, and enrollment failures read the same.
 */

export const REC_CALL_TIMEOUT_MS = 25_000;

export function mapRecommendationError(err: unknown, api: string): AppError {
  const name = (err as { name?: string })?.name ?? "";
  const message = err instanceof Error ? err.message : "";
  if (/AccessDenied|Unauthorized|Forbidden/i.test(name)) {
    return new AppError({ code: ErrorCode.AWS_ACCESS_DENIED, message: `${api} denied access. Attach the read permissions from the setup guide.`, cause: err });
  }
  if (name === "ValidationException" && /enroll|opt.?in/i.test(message)) {
    return new AppError({ code: ErrorCode.AWS_FEATURE_NOT_ENABLED, message: `${api} is not enrolled for this account. Enroll in the AWS console first.`, cause: err });
  }
  if (isThrottledError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_THROTTLED, message: `${api} throttled the request after retries.`, cause: err });
  }
  if (isRetryableSyncError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `${api} is temporarily unavailable.`, cause: err });
  }
  return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `${api} returned an unexpected response.`, cause: err });
}
