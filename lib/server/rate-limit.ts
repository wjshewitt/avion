// Simple in-memory token bucket per IP for API route protection

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  limit?: number; // tokens per window
  windowMs?: number; // window duration
}

export async function rateLimit(req: Request, opts: RateLimitOptions = {}) {
  const limit = opts.limit ?? 60;
  const windowMs = opts.windowMs ?? 60_000;
  const now = Date.now();
  const ip = getIp(req) || "anon";
  const bucket = buckets.get(ip) ?? { tokens: limit, lastRefill: now };

  // Refill
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const refill = Math.floor((elapsed / windowMs) * limit);
    bucket.tokens = Math.min(limit, bucket.tokens + refill);
    bucket.lastRefill = refill > 0 ? now : bucket.lastRefill;
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((bucket.lastRefill + windowMs - now) / 1000);
    const err: any = new Error("Rate limit exceeded");
    err.status = 429;
    err.retryAfter = Math.max(1, retryAfter);
    throw err;
  }

  bucket.tokens -= 1;
  buckets.set(ip, bucket);
}

function getIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // @ts-ignore
  return (req as any)?.ip || null;
}
