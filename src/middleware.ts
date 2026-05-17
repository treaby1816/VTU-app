import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware to intercept domain request hostnames and pass
 * resolved headers downstream to API routes and server components.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  
  // Clean host port numbers (e.g. localhost:3000 -> localhost)
  const cleanHost = host.split(":")[0].toLowerCase();
  
  // Clone request headers to securely pass variables downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", cleanHost);

  // Resume request pipe with custom tenant headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for files in public directory, static chunks,
     * Next.js internal dynamic routing assets, and static media files:
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.).*)",
  ],
};
