type Bucket = { tokens: number; updatedAt: number };

// In-memory rate limit (single instance). For multi-instance production, move this to Redis.
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { capacity: number; refillPerSec: number }
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now() / 1000;
  const b = buckets.get(key) || { tokens: opts.capacity, updatedAt: now };

  const elapsed = Math.max(0, now - b.updatedAt);
  b.tokens = Math.min(opts.capacity, b.tokens + elapsed * opts.refillPerSec);
  b.updatedAt = now;

  if (b.tokens < 1) {
    buckets.set(key, b);
    const need = 1 - b.tokens;
    return { ok: false, retryAfterSec: Math.ceil(need / opts.refillPerSec) };
  }

  b.tokens -= 1;
  buckets.set(key, b);
  return { ok: true };
}
