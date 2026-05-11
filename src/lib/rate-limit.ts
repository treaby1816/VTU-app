import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only create the ratelimit instance if Upstash Redis credentials are provided and valid
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasValidRedis = !!redisUrl && redisUrl.startsWith('https://') && !!redisToken;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimit = hasValidRedis 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;


/**
 * Helper middleware-like function to limit requests.
 * @param identifier String to identify the user/IP (e.g., "api_user_123" or request IP)
 * @returns { success, limit, reset, remaining }
 */
export async function checkRateLimit(identifier: string) {
  if (!rateLimit) {
    // If not configured, just let it pass
    return { success: true, limit: 10, reset: 0, remaining: 10 };
  }
  
  const { success, limit, reset, remaining } = await rateLimit.limit(identifier);
  return { success, limit, reset, remaining };
}
