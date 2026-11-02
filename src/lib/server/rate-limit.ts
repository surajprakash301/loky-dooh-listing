/**
 * Minimal in-memory failure limiter for the login endpoint: only failed attempts count,
 * and a successful login clears the counter. One process only; swap for Redis when scaling out.
 */
// Held on globalThis so every route bundle (and dev hot reload) shares the same counters.
const g = globalThis as unknown as { __lokyLoginFailures?: Map<string, number[]> };
const failures = (g.__lokyLoginFailures ??= new Map<string, number[]>());

function recent(key: string, windowMs: number): number[] {
  const now = Date.now();
  const hits = (failures.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length) failures.set(key, hits);
  else failures.delete(key);
  return hits;
}

export function isLimited(key: string, { limit, windowMs }: { limit: number; windowMs: number }): { limited: boolean; retryAfterSec: number } {
  const hits = recent(key, windowMs);
  if (hits.length < limit) return { limited: false, retryAfterSec: 0 };
  return { limited: true, retryAfterSec: Math.ceil((hits[0] + windowMs - Date.now()) / 1000) };
}

export function recordFailure(key: string, windowMs: number) {
  const hits = recent(key, windowMs);
  hits.push(Date.now());
  failures.set(key, hits);
  if (failures.size > 10_000) for (const k of failures.keys()) recent(k, windowMs);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
