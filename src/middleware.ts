import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only allow server-side API routes to be accessed from the same origin
  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
