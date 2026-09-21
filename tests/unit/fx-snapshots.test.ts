import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFx } = vi.hoisted(() => ({
  mockFx: { findFirst: vi.fn(), create: vi.fn() },
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: { fxSnapshot: { findFirst: mockFx.findFirst, create: mockFx.create } },
}));

import { getLatestFxSnapshot, saveFxSnapshot } from "@/lib/fx/snapshots";

/** NG-FX-03: rates pin per org, replay safely, read back latest-first. */
describe("fx snapshots (NG-FX-03)", () => {
  const rate = {
    base: "USD",
    quote: "NGN",
    rate: 1550,
    provider: "demo-fixture",
    observedAt: "2026-09-15T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pins provider, pair, rate, and timestamps", async () => {
    mockFx.findFirst.mockResolvedValue(null);
    mockFx.create.mockResolvedValue({ id: "fx-1" });

    const res = await saveFxSnapshot({ organizationId: "org-1", rate });

    expect(res).toEqual({ id: "fx-1", deduped: false });
    expect(mockFx.create).toHaveBeenCalledOnce();
    const data = mockFx.create.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      organizationId: "org-1",
      provider: "demo-fixture",
      baseCurrency: "USD",
      quoteCurrency: "NGN",
      rate: 1550,
      status: "active",
    });
    expect(data.retrievedAt).toEqual(new Date("2026-09-15T00:00:00.000Z"));
  });

  it("dedupes replays of the same retrieval", async () => {
    mockFx.findFirst.mockResolvedValue({ id: "fx-old" });
    const res = await saveFxSnapshot({ organizationId: "org-1", rate });
    expect(res).toEqual({ id: "fx-old", deduped: true });
    expect(mockFx.create).not.toHaveBeenCalled();
  });

  it("reads the latest snapshot back with provenance", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    vi.mocked(prisma.fxSnapshot.findFirst).mockResolvedValue({
      id: "fx-1",
      organizationId: "org-1",
      provider: "demo-fixture",
      baseCurrency: "USD",
      quoteCurrency: "NGN",
      rate: 1550,
      retrievedAt: new Date("2026-09-15T00:00:00.000Z"),
      effectiveAt: null,
      source: "seed",
      status: "active",
      createdAt: new Date("2026-09-16T00:00:00.000Z"),
    } as never);

    const dto = await getLatestFxSnapshot("org-1");
    expect(dto).toMatchObject({ id: "fx-1", rate: 1550, retrievedAt: "2026-09-15T00:00:00.000Z" });
    const call = vi.mocked(prisma.fxSnapshot.findFirst).mock.calls[0]!;
    expect(call[0]).toMatchObject({
      where: { organizationId: "org-1", baseCurrency: "USD", quoteCurrency: "NGN" },
      orderBy: { retrievedAt: "desc" },
    });
  });

  it("returns null when no snapshot exists", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    vi.mocked(prisma.fxSnapshot.findFirst).mockResolvedValue(null);
    await expect(getLatestFxSnapshot("org-1")).resolves.toBeNull();
  });
});
