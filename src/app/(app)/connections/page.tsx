import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import { maskAwsAccountId } from "@/schemas/demo";
import { getEnv } from "@/lib/env/server";
import {
  buildPermissionsPolicy,
  buildTrustPolicy,
  EXTERNAL_ID_PLACEHOLDER,
  NAIRAGUARD_ACCOUNT_PLACEHOLDER,
  TRUST_EXPECTATIONS,
} from "@/domain/aws/iam";
import { CopyBlock } from "@/components/ui/copy-block";
import { ConnectForm, DisconnectButton, ValidateButton } from "./connect-form";
import { getConnectionHealth, type AwsConnectionStatus } from "@/domain/aws/connection";
import { interpretConnectionStatus, retryBadge } from "@/domain/aws/errors";
import { listAwsAccounts } from "@/lib/aws/registry";

const FAILURE_STATUSES = ["AUTH_FAILED", "PERMISSION_DENIED", "RATE_LIMITED", "ERROR"];

/** NG-AWS-07: failures explain themselves — cause, retryability, and the fix. */
function FailurePanel({ status, lastError }: { status: AwsConnectionStatus; lastError: string | null }) {
  const interpreted = interpretConnectionStatus(status);
  const badge = retryBadge(status);
  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium">
        <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden /> {interpreted.headline}
        {badge ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{badge}</span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">Fix required before retry</span>
        )}
      </div>
      <div className="mt-1 text-sm leading-6 text-stone-600">{interpreted.detail}</div>
      {lastError && <div className="mt-1 font-mono text-[11px] leading-5 text-stone-500">{lastError}</div>}
      <div className="mt-1 text-xs leading-5 text-stone-600">
        <span className="font-medium text-stone-900">Next:</span> {interpreted.nextStep}
      </div>
      <ValidateButton />
      <ConnectForm />
    </>
  );
}

/** NG-AWS-05: every state explains itself — meaning, next step, last validated. */
function ConnectionHealthPanel({ status, lastValidatedAt }: { status: AwsConnectionStatus; lastValidatedAt: string | null }) {
  const health = getConnectionHealth(status);
  return (
    <div className="mt-4 rounded-xl bg-stone-50 p-4">
      <div className="font-mono text-[10px] tracking-widest text-stone-500">
        CONNECTION HEALTH · {health.title.toUpperCase()}
      </div>
      <p className="mt-1.5 text-xs leading-5 text-stone-600">{health.whatItMeans}</p>
      <p className="mt-1 text-xs leading-5 text-stone-600">
        <span className="font-medium text-stone-900">Next:</span> {health.nextStep}
      </p>
      <div className="mt-2 font-mono text-[11px] text-stone-500">
        Last validated: {lastValidatedAt ? new Date(lastValidatedAt).toLocaleString() : "never"}
      </div>
    </div>
  );
}

export default async function ConnectionsPage() {
  // NG-DEMO-02: seeded workspace account (single Production Account; multi-account arrives with live AWS).
  const dataset = getDemoDataset("balanced-startup");
  const masked = maskAwsAccountId(dataset.scenario.accountId);

  // NG-AWS-04: latest live connection for this org (session-derived, never client input).
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const membership = userId ? await prisma.membership.findFirst({ where: { userId } }) : null;
  const live = membership
    ? await prisma.awsConnection.findFirst({
        where: { organizationId: membership.organizationId },
        orderBy: { updatedAt: "desc" },
      })
    : null;
  // NG-AWS-06: discovered accounts in scope for this workspace.
  const discoveredAccounts =
    membership && live && live.status !== "DISCONNECTED" ? await listAwsAccounts(membership.organizationId) : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-zinc-500">Manage data sources for this workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-stone-500">AWS CONNECTION</div>
          {!live || live.status === "DISCONNECTED" ? (
            <>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden /> Not connected</div>
              <div className="mt-1 text-sm leading-6 text-stone-600">Connect an AWS account to analyze live costs. NairaGuard uses read-only, least-privilege access via IAM Role + STS — no long-lived keys stored.</div>
              <ConnectForm />
            </>
          ) : live.status === "PENDING" || live.status === "VALIDATING" ? (
            <>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden /> Validation pending</div>
              <div className="mt-1 font-mono text-xs leading-5 text-stone-600">{live.roleArn}</div>
              <div className="mt-3"><CopyBlock label="WORKSPACE EXTERNAL ID" value={live.externalId} /></div>
              <div className="mt-3 text-xs leading-5 text-stone-600">Paste this ID into the role&apos;s trust policy, then run validation.</div>
              <ValidateButton />
              <DisconnectButton />
            </>
          ) : FAILURE_STATUSES.includes(live.status) ? (
            <FailurePanel
              status={live.status as AwsConnectionStatus}
              lastError={live.lastError}
            />
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> {live.status.replace(/_/g, " ")}</div>
              <div className="mt-1 font-mono text-xs leading-5 text-stone-600">{live.roleArn}</div>
              <DisconnectButton />
            </>
          )}
          {live && live.status !== "DISCONNECTED" && (
            <ConnectionHealthPanel
              status={live.status as AwsConnectionStatus}
              lastValidatedAt={live.lastValidatedAt?.toISOString() ?? null}
            />
          )}
          {discoveredAccounts.length > 0 && (
            <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">
              <div className="font-mono text-[10px] tracking-widest text-stone-500">ACCOUNTS IN SCOPE · {discoveredAccounts.length}</div>
              <div className="mt-1 font-mono text-[11px]">
                {discoveredAccounts.map((a) => maskAwsAccountId(a.accountId)).join(" · ")}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-stone-500">ACTIVE DATASET</div>
          <div className="mt-2 text-sm font-medium">Currently active · Balanced Startup</div>
          <div className="text-sm text-stone-600">Workspace dataset · ~$1,378 · 2 opportunities · NGN estimates at recorded rate</div>
          <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">
            <div className="font-mono text-[10px] tracking-widest text-stone-500">AWS ACCOUNT</div>
            <div className="mt-1 text-sm font-medium text-stone-900">{dataset.scenario.accountName} · {masked}</div>
            <div className="text-xs text-stone-500">{dataset.scenario.regions.join(" · ")}</div>
          </div>
          <Link href="/dashboard?scenario=balanced-startup" className="mt-4 inline-flex rounded-full border border-stone-200 bg-white px-5 py-2 text-sm hover:bg-zinc-50">
            Change scenario in Dashboard
          </Link>
        </div>
      </div>

      <IamSetupGuide />
    </div>
  );
}

/**
 * NG-AWS-02: least-privilege setup guidance. Read-only content — role creation,
 * External ID issuance, and validation arrive in NG-AWS-03/04.
 */
function IamSetupGuide() {
  const deliveryAccount = getEnv().AWS_NAIRAGUARD_ACCOUNT_ID ?? NAIRAGUARD_ACCOUNT_PLACEHOLDER;
  const permissionsJson = JSON.stringify(buildPermissionsPolicy(), null, 2);
  const trustJson = JSON.stringify(buildTrustPolicy(EXTERNAL_ID_PLACEHOLDER, deliveryAccount), null, 2);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="font-mono text-xs tracking-widest text-stone-500">CONNECT AWS — SETUP GUIDE</div>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">Grant read-only access with an IAM role</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
        NairaGuard reads your account through a cross-account IAM role with short-lived STS credentials.
        Do not create access keys. Your workspace External ID is issued when connecting — enter the Role ARN above, update the trust policy, then run validation.
      </p>

      <ol className="mt-5 space-y-5">
        <li>
          <div className="text-sm font-medium">1 · Create the role in your AWS account</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            IAM → Roles → Create role → AWS account → Another AWS account → paste the NairaGuard account ID below →
            require an External ID → paste the ID issued to your workspace at connect time.
          </p>
        </li>
        <li>
          <div className="text-sm font-medium">2 · Attach the least-privilege permissions policy</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Cost Explorer, Cost Optimization Hub, Compute Optimizer evidence, and read-only discovery. No write actions.
          </p>
          <div className="mt-3"><CopyBlock label="NAIRAGUARD-READ-ONLY-POLICY.JSON" value={permissionsJson} /></div>
        </li>
        <li>
          <div className="text-sm font-medium">3 · Set the trust relationship</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Only NairaGuard may assume the role, and only with your workspace External ID.
          </p>
          <div className="mt-3"><CopyBlock label="TRUST-POLICY.JSON" value={trustJson} /></div>
        </li>
      </ol>

      <div className="mt-5 rounded-xl bg-stone-50 p-4">
        <div className="font-mono text-[10px] tracking-widest text-stone-500">TRUST EXPECTATIONS</div>
        <ul className="mt-2 space-y-1.5">
          {TRUST_EXPECTATIONS.map((line) => (
            <li key={line} className="flex items-start gap-2 text-xs leading-5 text-stone-600">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-stone-400" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
