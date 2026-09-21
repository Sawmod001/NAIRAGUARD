/**
 * Shared AWS credential shape — NG-OPT-01
 * Short-lived STS credentials handed per call set. Providers use and drop
 * them; nothing here persists or logs secrets.
 */
export type AwsTempCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};
