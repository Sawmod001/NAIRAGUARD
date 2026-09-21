/**
 * AWS inventory registry domain — NG-AWS-06
 * Pure validators for discovered identifiers. Writes go through
 * `@/lib/aws/registry` (session-scoped, idempotent upserts).
 */

const AWS_ACCOUNT_ID_RE = /^\d{12}$/;
const AWS_ORG_ID_RE = /^o-[a-z0-9]{10,32}$/;

/** 12-digit AWS account id from STS / Organizations APIs. */
export function isValidAwsAccountId(value: string): boolean {
  return AWS_ACCOUNT_ID_RE.test(value.trim());
}

/** AWS Organization id (o-xxxxxxxxxx) from the Organizations API. */
export function isValidAwsOrgId(value: string): boolean {
  return AWS_ORG_ID_RE.test(value.trim());
}
