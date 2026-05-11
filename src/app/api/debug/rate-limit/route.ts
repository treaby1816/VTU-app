import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Use IP address as identifier for rate limiting
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  
  const { success, limit, reset, remaining } = await checkRateLimit(`debug_api_${ip}`);

  if (!success) {
    return NextResponse.json(
      { 
        error: "Too Many Requests",
        limit,
        remaining,
        reset: new Date(reset).toISOString()
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  return NextResponse.json({
    message: "Request successful",
    ip,
    rateLimit: {
      limit,
      remaining,
      reset: new Date(reset).toISOString()
    }
  });
}
