/**
 * IAM guidance domain — NG-AWS-02
 * Pure builders for the least-privilege customer role. No AWS SDK, no network, no secrets.
 * Scope mirrors 03-AWS-FX-DATA-PIPELINE "Initial live scope": Cost Explorer,
 * Cost Optimization Hub, Compute Optimizer evidence, STS validation, org discovery.
 * AdministratorAccess is never required and never referenced here.
 */

/** Read-only actions NairaGuard needs — nothing else. */
export const REQUIRED_READ_ACTIONS = [
  // Cost Explorer: spend + dimensions
  "ce:GetCostAndUsage",
  "ce:GetDimensionValues",
  // Cost Optimization Hub: enrollment + recommendations
  "cost-optimization-hub:ListEnrollmentStatuses",
  "cost-optimization-hub:ListRecommendations",
  // Compute Optimizer: enrollment + per-service evidence (EC2, EBS, Lambda, RDS)
  "compute-optimizer:GetEnrollmentStatus",
  "compute-optimizer:GetEC2InstanceRecommendations",
  "compute-optimizer:GetEBSVolumeRecommendations",
  "compute-optimizer:GetLambdaFunctionRecommendations",
  "compute-optimizer:GetRDSDatabaseRecommendations",
  // Read-only discovery (account/org mapping where permissions allow)
  "organizations:DescribeOrganization",
  "organizations:ListAccounts",
] as const;

/** Placeholder rendered until NG-AWS-04 issues the workspace External ID. */
export const EXTERNAL_ID_PLACEHOLDER = "ng_<issued-when-you-connect>";

/** Placeholder for the NairaGuard delivery account until AWS_NAIRAGUARD_ACCOUNT_ID is set. */
export const NAIRAGUARD_ACCOUNT_PLACEHOLDER = "<NAIRAGUARD_AWS_ACCOUNT_ID>";

export type IamPolicyDocument = {
  Version: "2012-10-17";
  Statement: { Effect: "Allow"; Action: string[]; Resource: string[] }[];
};

/** Least-privilege permissions policy. Service APIs require Resource "*". */
export function buildPermissionsPolicy(): IamPolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [{ Effect: "Allow", Action: [...REQUIRED_READ_ACTIONS], Resource: ["*"] }],
  };
}

export type TrustPolicyDocument = {
  Version: "2012-10-17";
  Statement: {
    Effect: "Allow";
    Principal: { AWS: string };
    Action: "sts:AssumeRole";
    Condition: { StringEquals: { "sts:ExternalId": string } };
  }[];
};

/**
 * Cross-account trust policy. The External ID binds the trust to one workspace —
 * AssumeRole calls without it are denied even with the role ARN.
 */
export function buildTrustPolicy(externalId: string, nairaguardAccountId: string): TrustPolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: `arn:aws:iam::${nairaguardAccountId}:root` },
        Action: "sts:AssumeRole",
        Condition: { StringEquals: { "sts:ExternalId": externalId } },
      },
    ],
  };
}

const ROLE_ARN_RE = /^arn:aws:iam::(\d{12}):role\/([\w+=,.@/-]+)$/;

/** Strict Role ARN shape check (NG-AWS-04 will additionally verify it via STS). */
export function isValidRoleArn(arn: string): boolean {
  return ROLE_ARN_RE.test(arn.trim());
}

/** Split a valid Role ARN into account + role path/name. Null when malformed. */
export function parseRoleArn(arn: string): { accountId: string; roleName: string } | null {
  const m = ROLE_ARN_RE.exec(arn.trim());
  if (!m) return null;
  return { accountId: m[1]!, roleName: m[2]! };
}

/** Trust expectations shown alongside the guide — no admin, revocable, STS-only. */
export const TRUST_EXPECTATIONS = [
  "NairaGuard assumes the role with short-lived STS credentials — it never asks for access keys.",
  "Every assumption carries your workspace External ID; requests without it are denied.",
  "The policy is read-only: cost, recommendation, and discovery actions. No AdministratorAccess, no write actions.",
  "You can revoke access anytime by deleting or editing the role in your AWS account.",
] as const;
