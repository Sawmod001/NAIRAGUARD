import { AssumeRoleCommand, GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import type { AwsConnectionStatus } from "@/domain/aws/connection";

/**
 * STS role validation — NG-AWS-03
 * AssumeRole with the workspace External ID, then GetCallerIdentity on the
 * temporary credentials to confirm the role account. Credentials are used
 * here and dropped — never persisted, never logged.
 */

export const STS_DEFAULT_REGION = "eu-west-1";
const VALIDATION_TIMEOUT_MS = 20_000;

export type StsFailureStatus = Extract<
  AwsConnectionStatus,
  "AUTH_FAILED" | "PERMISSION_DENIED" | "RATE_LIMITED" | "ERROR"
>;

export class StsValidationError extends Error {
  readonly status: StsFailureStatus;
  constructor(status: StsFailureStatus, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StsValidationError";
    this.status = status;
  }
}

/**
 * Map SDK failures onto the connection machine. PERMISSION_DENIED is reserved
 * for downstream API probes (NG-SYNC) — STS alone cannot produce it.
 */
export function mapStsErrorToStatus(err: unknown): Exclude<StsFailureStatus, "PERMISSION_DENIED"> {
  const name = (err as { name?: string })?.name ?? "";
  if (/Throttl|TooManyRequests|RequestLimitExceeded/i.test(name)) return "RATE_LIMITED";
  if (
    /Denied|Forbidden|Unauthorized|InvalidClientToken|InvalidIdentityToken|SignatureDoesNotMatch|UnrecognizedClient|InvalidAccessKey|ExpiredToken/i.test(
      name
    )
  ) {
    return "AUTH_FAILED";
  }
  return "ERROR";
}

function truncate(message: string): string {
  return message.length > 500 ? `${message.slice(0, 497)}…` : message;
}

export async function validateRoleAssumable(input: {
  roleArn: string;
  externalId: string;
  region?: string;
}): Promise<{ accountId: string }> {
  const region = input.region ?? STS_DEFAULT_REGION;
  const abortSignal = AbortSignal.timeout(VALIDATION_TIMEOUT_MS);
  const client = new STSClient({ region });
  try {
    const assumed = await client.send(
      new AssumeRoleCommand({
        RoleArn: input.roleArn,
        RoleSessionName: `nairaguard-validate-${Date.now().toString(36)}`,
        ExternalId: input.externalId,
        DurationSeconds: 900,
      }),
      { abortSignal }
    );
    const creds = assumed.Credentials;
    if (!creds?.AccessKeyId || !creds?.SecretAccessKey || !creds?.SessionToken) {
      throw new StsValidationError("ERROR", "STS returned incomplete temporary credentials.");
    }
    const callerClient = new STSClient({
      region,
      credentials: {
        accessKeyId: creds.AccessKeyId,
        secretAccessKey: creds.SecretAccessKey,
        sessionToken: creds.SessionToken,
      },
    });
    const identity = await callerClient.send(new GetCallerIdentityCommand({}), { abortSignal });
    if (!identity.Account) {
      throw new StsValidationError("ERROR", "Could not confirm the assumed role account.");
    }
    return { accountId: identity.Account };
  } catch (e) {
    if (e instanceof StsValidationError) throw e;
    const status = mapStsErrorToStatus(e);
    const detail = e instanceof Error ? e.message : "Unknown STS failure.";
    throw new StsValidationError(status, truncate(`STS validation failed (${status}): ${detail}`), { cause: e });
  }
}
