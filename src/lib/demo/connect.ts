"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";

/**
 * Connect to Demo — NG-DEMO-06
 * Authenticated workspace entry: Try Demo → Create account / Sign in → Connect to Demo → Workspace.
 * - Derives the organization from the session server-side (never trusts client org id).
 * - Idempotent: an org with prior activity is already connected — no duplicate marker.
 * - Writes the first ActivityEvent, which is also what stops the (app) first-run
 *   onboarding redirect. No separate demo-only rendering architecture.
 */

export async function connectToDemo(): Promise<
  { ok: true; organizationId: string; organizationName: string; alreadyConnected: boolean } | { ok: false; error: string }
> {
  const { userId } = await requireAuth();
  const rl = checkRateLimit(`action:connectToDemo:${userId}`, RatePresets.apiGeneral.limit, RatePresets.apiGeneral.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many requests. Slow down and try again." };

  try {
    const org = await ensurePersonalOrganization(userId);
    const existing = await prisma.activityEvent.count({ where: { organizationId: org.id } });
    if (existing > 0) {
      return { ok: true, organizationId: org.id, organizationName: org.name, alreadyConnected: true };
    }
    await prisma.activityEvent.create({
      data: {
        organizationId: org.id,
        type: "workspace.connected",
        title: "Connected to workspace",
        description: "Workspace is ready. Costs, findings, and estimates share one domain model.",
      },
    });
    return { ok: true, organizationId: org.id, organizationName: org.name, alreadyConnected: false };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not connect. Please try again.", cause: e });
  }
}
