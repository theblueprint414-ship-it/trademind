import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

let redis: Redis | null = null;
function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch {
    return null;
  }
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(type: "strict" | "normal" | "loose"): Ratelimit | null {
  if (limiters.has(type)) return limiters.get(type)!;
  const r = getRedis();
  if (!r) return null;
  try {
    const configs = {
      strict: Ratelimit.slidingWindow(5, "1 m"),
      normal: Ratelimit.slidingWindow(30, "1 m"),
      loose:  Ratelimit.slidingWindow(100, "1 m"),
    };
    const limiter = new Ratelimit({ redis: r, limiter: configs[type], analytics: false });
    limiters.set(type, limiter);
    return limiter;
  } catch {
    return null;
  }
}

export async function rateLimit(
  req: NextRequest,
  type: "strict" | "normal" | "loose" = "normal"
): Promise<{ ok: boolean; response?: Response }> {
  let limiter: Ratelimit | null = null;
  try { limiter = getLimiter(type); } catch { return { ok: true }; }
  if (!limiter) return { ok: true };

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  try {
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    if (!success) {
      return {
        ok: false,
        response: Response.json(
          { error: "Too many requests. Please slow down." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        ),
      };
    }
  } catch {
    // Upstash unreachable — never block legitimate users
  }

  return { ok: true };
}