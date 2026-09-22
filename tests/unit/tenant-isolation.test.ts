import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth, mockMembership, mockOrganization } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockMembership: { findFirst: vi.fn(), findMany: vi.fn() },
  mockOrganization: { findUnique: vi.fn() },
}));

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    membership: { findFirst: mockMembership.findFirst, findMany: mockMembership.findMany },
    organization: { findUnique: mockOrganization.findUnique },
  },
}));

import { ErrorCode } from "@/lib/errors/codes";
import {
  assertMembership,
  getAuthorizedOrganizationIds,
  requireAuthWithOrg,
  requireOrganization,
  scopedOrganizationId,
} from "@/lib/auth/authorization";

/** NG-SEC-02: membership is the firewall — foreign org ids never authorize. */
describe("tenant isolation (NG-SEC-02)", () => {
  const session = (userId: string) => ({ user: { id: userId, email: "a@example.com" } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the caller's org from the session", async () => {
    mockAuth.mockResolvedValue(session("u-1"));
    mockMembership.findFirst.mockResolvedValue({
      userId: "u-1",
      organizationId: "org-1",
      organization: { id: "org-1", name: "Acme" },
    });
    const ctx = await requireAuthWithOrg();
    expect(ctx).toMatchObject({ userId: "u-1", organizationId: "org-1", organizationName: "Acme" });
    expect(mockMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "u-1" } }));
  });

  it("rejects unauthenticated callers", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireAuthWithOrg()).rejects.toMatchObject({ code: ErrorCode.UNAUTHENTICATED });
  });

  it("rejects authenticated users with no membership", async () => {
    mockAuth.mockResolvedValue(session("u-9"));
    mockMembership.findFirst.mockResolvedValue(null);
    await expect(requireAuthWithOrg()).rejects.toMatchObject({ code: ErrorCode.TENANT_FORBIDDEN });
  });

  it("asserts membership per org, never by URL alone", async () => {
    mockMembership.findFirst.mockImplementation(async ({ where }: { where: { userId: string; organizationId: string } }) =>
      where.userId === "u-1" && where.organizationId === "org-1" ? { id: "m-1" } : null
    );
    await expect(assertMembership("u-1", "org-1")).resolves.toBeUndefined();
    await expect(assertMembership("u-1", "org-evil")).rejects.toMatchObject({ code: ErrorCode.TENANT_FORBIDDEN });
    expect.assertions(2);
  });

  it("requireOrganization returns only member orgs", async () => {
    mockMembership.findFirst.mockImplementation(async ({ where }: { where: { userId: string; organizationId: string } }) =>
      where.organizationId === "org-1" ? { id: "m-1" } : null
    );
    mockOrganization.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
      where.id === "org-1" ? { id: "org-1", name: "Acme" } : null
    );
    await expect(requireOrganization("u-1", "org-1")).resolves.toMatchObject({ id: "org-1" });
    await expect(requireOrganization("u-1", "org-evil")).rejects.toMatchObject({ code: ErrorCode.TENANT_FORBIDDEN });
    mockMembership.findFirst.mockImplementation(async () => ({ id: "m-2" }));
    mockOrganization.findUnique.mockResolvedValue(null);
    await expect(requireOrganization("u-1", "org-ghost")).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  it("scopes requested ids to the caller's memberships", async () => {
    mockMembership.findMany.mockResolvedValue([{ organizationId: "org-1" }, { organizationId: "org-2" }]);
    expect(await getAuthorizedOrganizationIds("u-1")).toEqual(["org-1", "org-2"]);
    expect(await scopedOrganizationId("u-1", null)).toBe("org-1");
    expect(await scopedOrganizationId("u-1", "org-2")).toBe("org-2");
    await expect(scopedOrganizationId("u-1", "org-evil")).rejects.toMatchObject({ code: ErrorCode.TENANT_FORBIDDEN });
    mockMembership.findMany.mockResolvedValue([]);
    await expect(scopedOrganizationId("u-1", null)).rejects.toMatchObject({ code: ErrorCode.TENANT_FORBIDDEN });
  });

  it("database failures fail closed, never authorized", async () => {
    mockAuth.mockResolvedValue(session("u-1"));
    mockMembership.findFirst.mockRejectedValue(new Error("db down"));
    await expect(requireAuthWithOrg()).rejects.toThrow("db down");
  });
});
