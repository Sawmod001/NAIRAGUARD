import { describe, expect, it } from "vitest";
import { mapStsErrorToStatus, StsValidationError } from "@/infrastructure/providers/aws/sts";

/** NG-AWS-03: STS failures map onto distinguishable connection states (no network). */
describe("sts error mapping (NG-AWS-03)", () => {
  it("trust/credential problems become AUTH_FAILED", () => {
    for (const name of [
      "AccessDeniedException",
      "AccessDenied",
      "InvalidClientTokenId",
      "SignatureDoesNotMatch",
      "UnrecognizedClientException",
    ]) {
      expect(mapStsErrorToStatus({ name, message: "x" })).toBe("AUTH_FAILED");
    }
  });

  it("throttling becomes RATE_LIMITED", () => {
    for (const name of ["ThrottlingException", "Throttling", "TooManyRequestsException", "RequestLimitExceeded"]) {
      expect(mapStsErrorToStatus({ name, message: "x" })).toBe("RATE_LIMITED");
    }
  });

  it("unknown, timeout, and abort failures become ERROR", () => {
    expect(mapStsErrorToStatus({ name: "TimeoutError", message: "x" })).toBe("ERROR");
    expect(mapStsErrorToStatus({ name: "AbortError", message: "x" })).toBe("ERROR");
    expect(mapStsErrorToStatus({ name: "WeirdNewFault", message: "x" })).toBe("ERROR");
    expect(mapStsErrorToStatus(null)).toBe("ERROR");
    expect(mapStsErrorToStatus(undefined)).toBe("ERROR");
  });

  it("StsValidationError carries its status", () => {
    const err = new StsValidationError("AUTH_FAILED", "nope");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe("AUTH_FAILED");
  });
});
