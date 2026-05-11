import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only create the ratelimit instance if Upstash Redis credentials are provided
const hasRedisCredentials = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimit = hasRedisCredentials 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      /**
       * Optional prefix for the keys used in redis. This is useful if you want to share a redis
       * instance with other applications and want to avoid key collisions. The default prefix is
       * "@upstash/ratelimit"
       */ 
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
