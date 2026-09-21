import { describe, expect, it } from "vitest";
import { isValidAwsAccountId, isValidAwsOrgId } from "@/domain/aws/registry";

/** NG-AWS-06: only well-formed discovered identifiers may enter the registry. */
describe("aws registry validators (NG-AWS-06)", () => {
  it("accepts 12-digit account ids", () => {
    expect(isValidAwsAccountId("123456789012")).toBe(true);
    expect(isValidAwsAccountId(" 123456789012 ")).toBe(true);
    expect(isValidAwsAccountId("12345678901")).toBe(false);
    expect(isValidAwsAccountId("1234567890123")).toBe(false);
    expect(isValidAwsAccountId("12345678901a")).toBe(false);
    expect(isValidAwsAccountId("")).toBe(false);
  });

  it("accepts AWS organization ids", () => {
    expect(isValidAwsOrgId("o-a1b2c3d4e5")).toBe(true);
    expect(isValidAwsOrgId("o-short")).toBe(false);
    expect(isValidAwsOrgId("r-a1b2c3d4e5")).toBe(false);
    expect(isValidAwsOrgId("")).toBe(false);
  });
});
