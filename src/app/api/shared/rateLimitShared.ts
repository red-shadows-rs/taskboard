import type { NextRequest } from "next/server";

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

function getClientIp(request: NextRequest): string {
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = request.headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function cleanup(now: number): void {
  if (store.size < 10000) return;
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  request: NextRequest,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  cleanup(now);

  const record = store.get(key);
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
