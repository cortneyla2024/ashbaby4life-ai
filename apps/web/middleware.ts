import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Handle potential 404 errors by redirecting to appropriate pages
  if (pathname === '/') {
    // Root path is handled by page.tsx
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // API routes are handled by their respective route handlers
    return NextResponse.next();
  }

  // Handle static files
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // For all other routes, let Next.js handle them
  // If a page doesn't exist, Next.js will show the not-found page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
