import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/auth/callback";

/** NG-SEC-01: callbackUrl can never bounce an authenticated user off-site. */
describe("safe callback url (NG-SEC-01)", () => {
  it("keeps same-origin paths with queries", () => {
    expect(safeCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(safeCallbackUrl("/onboarding")).toBe("/onboarding");
    expect(safeCallbackUrl("/dashboard?scenario=fx-pressure&period=7")).toBe("/dashboard?scenario=fx-pressure&period=7");
  });

  it("falls back on missing input", () => {
    expect(safeCallbackUrl(null)).toBe("/dashboard");
    expect(safeCallbackUrl(undefined)).toBe("/dashboard");
    expect(safeCallbackUrl("")).toBe("/dashboard");
    expect(safeCallbackUrl(null, "/onboarding")).toBe("/onboarding");
  });

  it("rejects absolute, protocol-relative, and schemed URLs", () => {
    expect(safeCallbackUrl("https://evil.example/phish")).toBe("/dashboard");
    expect(safeCallbackUrl("http://evil.example")).toBe("/dashboard");
    expect(safeCallbackUrl("//evil.example/x")).toBe("/dashboard");
    expect(safeCallbackUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(safeCallbackUrl("data:text/html,hi")).toBe("/dashboard");
    expect(safeCallbackUrl("\\evil.example")).toBe("/dashboard");
    expect(safeCallbackUrl("dashboard")).toBe("/dashboard");
  });
});
