type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const clientIdHeader = "x-wedding-client-id";

function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  request: Request,
  namespace: string,
  { limit, windowMs }: RateLimitOptions
) {
  const now = Date.now();
  const clientId = request.headers.get(clientIdHeader)?.trim();
  const subject = clientId ? `client:${clientId}` : `ip:${clientIp(request)}`;
  const key = `${namespace}:${subject}`;
  const bucket = buckets.get(key);

  if (buckets.size > 10000) {
    for (const [bucketKey, value] of buckets.entries()) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
