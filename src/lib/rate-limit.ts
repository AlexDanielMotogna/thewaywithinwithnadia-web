type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window limiter. State lives only in this process's
 * memory — fine for a single long-running server, but a multi-instance
 * serverless deploy would need a shared store (e.g. Upstash) instead.
 * Revisit once hosting (PENDING.md #14) is decided.
 *
 * No `server-only` guard: this holds no secrets and is pure/synchronous,
 * which is exactly what makes it unit-testable (see rate-limit.test.ts).
 * `protectPublicAction()`, which actually touches env secrets, carries
 * the guard instead.
 */
export function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number; now?: number },
): boolean {
  const now = opts.now ?? Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  if (bucket.count >= opts.max) return false;

  bucket.count += 1;
  return true;
}
