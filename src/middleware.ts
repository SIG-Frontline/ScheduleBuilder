import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // // Redirect from callback if Auth0 denied access
  if (
    url.pathname === '/auth/callback' &&
    url.href.includes('?error=access_denied')
  ) {
    // You could also add a query like "?auth=fail" to show a message on the homepage
    return NextResponse.redirect(new URL('/?error=invalid_email', request.url));
  }

  // Default behavior — apply Auth0 middleware
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
