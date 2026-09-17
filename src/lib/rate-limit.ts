/**
 * Simple in-memory sliding-window rate limiter
 * Single-process only — spec notes Redis needed for multi-instance. Returns 429 + Retry-After.
 */

type Entry = number[]; // timestamps ms

const store = new Map<string, Entry>();

function now() { return Date.now(); }

function prune(key: string, windowMs: number) {
  const arr = store.get(key);
  if (!arr) return [];
  const cutoff = now() - windowMs;
  const filtered = arr.filter((t) => t > cutoff);
  if (filtered.length === 0) store.delete(key);
  else store.set(key, filtered);
  return filtered;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const arr = prune(key, windowMs);
  if (arr.length >= limit) {
    const oldest = arr[0] ?? now();
    const retryAfterMs = Math.max(0, windowMs - (now() - oldest));
    return { allowed: false, retryAfterMs };
  }
  arr.push(now());
  store.set(key, arr);
  return { allowed: true, retryAfterMs: 0 };
}

// For testing: clear
export function clearRateLimitStore() { store.clear(); }

// Presets per Hardening Spec #2
export const RatePresets = {
  auth: { limit: 10, windowMs: 10 * 60 * 1000 }, // 10 / 10min per IP+account
  apiGeneral: { limit: 100, windowMs: 60 * 1000 }, // 100 / min per user
  cost: { limit: 60, windowMs: 60 * 1000 }, // 60 / min
} as const;
