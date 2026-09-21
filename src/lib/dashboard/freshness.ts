import { prisma } from "@/lib/prisma/client";

/**
 * Workspace freshness — NG-DASH-06
 * Server-side only. One read model for "when did data last move": latest sync
 * run, latest persisted cost snapshot, and live connection state. Readers use
 * it to label freshness honestly instead of hardcoding sync copy.
 */

export type WorkspaceFreshness = {
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  snapshotObservedAt: string | null;
  connectionStatus: string | null;
};

export async function getWorkspaceFreshness(organizationId: string): Promise<WorkspaceFreshness> {
  const [run, snapshot, connection] = await Promise.all([
    prisma.syncRun.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: { status: true, finishedAt: true, createdAt: true },
    }),
    prisma.costSnapshot.findFirst({
      where: { organizationId },
      orderBy: { observedAt: "desc" },
      select: { observedAt: true },
    }),
    prisma.awsConnection.findFirst({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    }),
  ]);
  return {
    lastSyncAt: (run?.finishedAt ?? run?.createdAt)?.toISOString() ?? null,
    lastSyncStatus: run?.status ?? null,
    snapshotObservedAt: snapshot?.observedAt.toISOString() ?? null,
    connectionStatus: connection && connection.status !== "DISCONNECTED" ? connection.status : null,
  };
}
