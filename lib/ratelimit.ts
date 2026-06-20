// In-memory sliding-window rate limiter, keyed per (bucket, client).
//
// This is PER serverless instance — a deterrent against a single client
// spamming a warm instance (burning LLM credits / hammering the Walrus
// relayer), not a distributed guarantee. Vercel may run several instances,
// so the effective ceiling is roughly N× these limits; that's acceptable for
// the goal. No external store (Redis) to keep the submission self-contained.

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Map<string, Hit>>();

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds until the window resets
}

export function rateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateResult {
  let b = buckets.get(bucket);
  if (!b) {
    b = new Map();
    buckets.set(bucket, b);
  }
  let hit = b.get(key);
  if (!hit || now >= hit.resetAt) {
    hit = { count: 0, resetAt: now + windowMs };
    b.set(key, hit);
  }
  hit.count++;
  // Opportunistic cleanup so a long-lived instance doesn't grow unbounded.
  if (b.size > 5000) {
    for (const [k, v] of b) if (now >= v.resetAt) b.delete(k);
  }
  return {
    ok: hit.count <= limit,
    remaining: Math.max(0, limit - hit.count),
    retryAfter: Math.max(0, Math.ceil((hit.resetAt - now) / 1000)),
  };
}

// Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Standard 429 with a Retry-After header.
export function tooMany(r: RateResult): Response {
  return Response.json(
    { error: "rate_limited", retryAfter: r.retryAfter },
    { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
  );
}
