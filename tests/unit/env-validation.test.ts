import { describe, expect, it } from "vitest";
import { serverEnvSchema } from "@/schemas/env";

/** NG-SEC-03: weak session secrets fail fast; empty stays allowed for Demo boot. */
describe("server env validation (NG-SEC-03)", () => {
  it("rejects short AUTH_SECRET values", () => {
    expect(serverEnvSchema.safeParse({ AUTH_SECRET: "short" }).success).toBe(false);
    expect(serverEnvSchema.safeParse({ AUTH_SECRET: "x".repeat(31) }).success).toBe(false);
  });

  it("accepts strong, empty, and missing AUTH_SECRET", () => {
    expect(serverEnvSchema.safeParse({ AUTH_SECRET: "x".repeat(32) }).success).toBe(true);
    expect(serverEnvSchema.safeParse({ AUTH_SECRET: "" }).success).toBe(true);
    expect(serverEnvSchema.safeParse({}).success).toBe(true);
  });
});
