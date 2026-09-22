/**
 * Safe post-auth redirect — NG-SEC-01
 * sign-in/sign-up honor ?callbackUrl= for the Try-Demo chain, but a crafted
 * link must never bounce an authenticated user off-site. Only same-origin
 * absolute paths survive; everything else falls back to the default.
 */
export function safeCallbackUrl(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  const value = raw.trim();
  // Same-origin path only: single leading slash, no backslashes, no scheme.
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallback;
  return value || fallback;
}
