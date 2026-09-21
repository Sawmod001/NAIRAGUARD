import { describe, expect, it } from "vitest";
import {
  buildPermissionsPolicy,
  buildTrustPolicy,
  isValidRoleArn,
  parseRoleArn,
  REQUIRED_READ_ACTIONS,
  TRUST_EXPECTATIONS,
} from "@/domain/aws/iam";

/** NG-AWS-02: least-privilege guidance is exact — no admin, no writes, no wildcards. */
describe("iam guidance (NG-AWS-02)", () => {
  it("permissions policy is read-only and scoped", () => {
    const policy = buildPermissionsPolicy();
    expect(policy.Version).toBe("2012-10-17");
    expect(policy.Statement).toHaveLength(1);
    expect(policy.Statement[0]!.Effect).toBe("Allow");
    expect(policy.Statement[0]!.Action).toEqual([...REQUIRED_READ_ACTIONS]);
    for (const action of policy.Statement[0]!.Action) {
      expect(action).not.toBe("*");
      // Allowlist: read-only verbs (Get/List/Describe) on the four scoped services.
      expect(action).toMatch(/^(ce|cost-optimization-hub|compute-optimizer|organizations):(Get|List|Describe)[A-Za-z0-9]*$/);
    }
  });

  it("covers the initial live scope", () => {
    const actions = [...REQUIRED_READ_ACTIONS];
    expect(actions.some((a) => a.startsWith("ce:"))).toBe(true);
    expect(actions.some((a) => a.startsWith("cost-optimization-hub:"))).toBe(true);
    expect(actions.some((a) => a.startsWith("compute-optimizer:"))).toBe(true);
    expect(actions.some((a) => a.startsWith("organizations:"))).toBe(true);
  });

  it("trust policy binds AssumeRole to the workspace External ID", () => {
    const trust = buildTrustPolicy("ng_abc123", "111122223333");
    const stmt = trust.Statement[0]!;
    expect(stmt.Action).toBe("sts:AssumeRole");
    expect(stmt.Principal).toEqual({ AWS: "arn:aws:iam::111122223333:root" });
    expect(stmt.Condition).toEqual({ StringEquals: { "sts:ExternalId": "ng_abc123" } });
  });

  it("validates Role ARN shape strictly", () => {
    expect(isValidRoleArn("arn:aws:iam::123456789012:role/NairaGuardReadOnly")).toBe(true);
    expect(isValidRoleArn("arn:aws:iam::123456789012:role/path/NairaGuardReadOnly")).toBe(true);
    expect(isValidRoleArn("arn:aws:iam::123456789012:user/Bob")).toBe(false);
    expect(isValidRoleArn("arn:aws:iam::1234:role/X")).toBe(false);
    expect(isValidRoleArn("not-an-arn")).toBe(false);
    expect(isValidRoleArn("")).toBe(false);
  });

  it("parses account and role name from a valid ARN", () => {
    expect(parseRoleArn("arn:aws:iam::123456789012:role/NairaGuardReadOnly")).toEqual({
      accountId: "123456789012",
      roleName: "NairaGuardReadOnly",
    });
    expect(parseRoleArn("garbage")).toBeNull();
  });

  it("expectations promise no admin and revocability", () => {
    const text = TRUST_EXPECTATIONS.join(" ");
    expect(text).toMatch(/never asks for access keys/);
    expect(text).toMatch(/No AdministratorAccess/);
    expect(text).toMatch(/revoke/i);
  });
});
