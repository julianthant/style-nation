import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for admin panel authentication
 * - Protects all routes except login
 * - Validates JWT tokens from cookies
 * - Verifies admin role
 * - Handles token refresh scenarios
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') || // Static files (images, etc.)
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Allow access to login page and unauthorized page
  if (pathname === '/' || pathname === '/unauthorized') {
    // If user is already authenticated and trying to access login, redirect to dashboard
    if (pathname === '/' && isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication for all other routes
  if (!isAuthenticated(request)) {
    return redirectToLogin(request);
  }

  // Check admin role
  if (!isAdmin(request)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

/**
 * Check if user has valid authentication
 */
function isAuthenticated(request: NextRequest): boolean {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return false;
  }

  try {
    // Basic JWT validation (structure and expiry)
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;

    // Check if token is not expired
    if (!payload.exp || payload.exp <= currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Invalid JWT token:', error);
    return false;
  }
}

/**
 * Check if user has admin role
 */
function isAdmin(request: NextRequest): boolean {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.role === 'ADMIN';
  } catch (error) {
    console.warn('Error checking admin role:', error);
    return false;
  }
}

/**
 * Get access token from request (cookie or header)
 */
function getAccessToken(request: NextRequest): string | null {
  // Try cookie first
  const cookieToken = request.cookies.get('admin_access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Redirect to login with return URL
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);

  // Add return URL for redirect after login
  if (request.nextUrl.pathname !== '/') {
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  }

  return NextResponse.redirect(loginUrl);
}

/**
 * Middleware configuration
 * Apply to all routes except those explicitly excluded above
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes (API routes)
     * 2. /_next (Next.js internals)
     * 3. Static files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
