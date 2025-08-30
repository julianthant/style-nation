import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextResponse methods first
const mockRedirect = jest.fn();
const mockNext = jest.fn();

// Mock the module before importing
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

// Override the mocked methods with our spies
(NextResponse.redirect as jest.Mock) = mockRedirect;
(NextResponse.next as jest.Mock) = mockNext;

// Helper function to create a mock request
function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {}
) {
  const url = `http://localhost:3002${pathname}`;
  return {
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(),
    },
    url,
    cookies: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    },
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as unknown as NextRequest;
}

// Helper function to create a valid JWT token
function createValidToken(payload: any = {}, exp?: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const tokenPayload = {
    sub: 'user-id',
    role: 'ADMIN',
    exp: exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    ...payload,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  const signature = 'signature';
  return `${header}.${payloadBase64}.${signature}`;
}

function createExpiredToken(): string {
  return createValidToken({}, Math.floor(Date.now() / 1000) - 3600); // 1 hour ago
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNext.mockReturnValue('next-response');
    mockRedirect.mockReturnValue('redirect-response');
  });

  describe('Public routes and assets', () => {
    it('should allow Next.js internals', () => {
      const request = createMockRequest('/_next/static/chunks/main.js');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should allow API routes', () => {
      const request = createMockRequest('/api/auth/login');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should allow static files', () => {
      const request = createMockRequest('/favicon.ico');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should allow files with extensions', () => {
      const request = createMockRequest('/logo.png');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });
  });

  describe('Login page', () => {
    it('should allow access to login page when not authenticated', () => {
      const request = createMockRequest('/login');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should redirect authenticated users away from login page', () => {
      const validToken = createValidToken();
      const request = createMockRequest('/login', { admin_access_token: validToken });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/dashboard', request.url).toString());
      expect(mockNext).not.toHaveBeenCalled();
      expect(result).toBe('redirect-response');
    });

    it('should allow users with expired tokens to access login', () => {
      const expiredToken = createExpiredToken();
      const request = createMockRequest('/login', { admin_access_token: expiredToken });
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });
  });

  describe('Unauthorized page', () => {
    it('should allow access to unauthorized page', () => {
      const request = createMockRequest('/unauthorized');
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });
  });

  describe('Protected routes', () => {
    it('should allow authenticated admin users to access dashboard', () => {
      const validToken = createValidToken({ role: 'ADMIN' });
      const request = createMockRequest('/dashboard', { admin_access_token: validToken });
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should redirect unauthenticated users to login', () => {
      const request = createMockRequest('/dashboard');
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(mockNext).not.toHaveBeenCalled();
      expect(result).toBe('redirect-response');
    });

    it('should redirect users with expired tokens to login', () => {
      const expiredToken = createExpiredToken();
      const request = createMockRequest('/dashboard', { admin_access_token: expiredToken });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(result).toBe('redirect-response');
    });

    it('should redirect users with invalid token format to login', () => {
      const request = createMockRequest('/dashboard', { admin_access_token: 'invalid-token' });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(result).toBe('redirect-response');
    });

    it('should redirect non-admin users to unauthorized page', () => {
      const userToken = createValidToken({ role: 'USER' });
      const request = createMockRequest('/dashboard', { admin_access_token: userToken });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/unauthorized', request.url).toString());
      expect(result).toBe('redirect-response');
    });

    it('should not add returnTo parameter for root path', () => {
      const request = createMockRequest('/');
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login', request.url).toString());
      expect(result).toBe('redirect-response');
    });
  });

  describe('Token extraction', () => {
    it('should extract token from Authorization header when cookie not available', () => {
      const validToken = createValidToken();
      const request = createMockRequest(
        '/dashboard',
        {},
        { authorization: `Bearer ${validToken}` }
      );
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should prioritize cookie over Authorization header', () => {
      const cookieToken = createValidToken();
      const headerToken = createValidToken({ role: 'USER' }); // Different role
      const request = createMockRequest(
        '/dashboard',
        { admin_access_token: cookieToken },
        { authorization: `Bearer ${headerToken}` }
      );
      
      const result = middleware(request);
      
      // Should use cookie token (ADMIN role), not header token (USER role)
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should handle malformed Authorization header', () => {
      const request = createMockRequest(
        '/dashboard',
        {},
        { authorization: 'InvalidHeader' }
      );
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(result).toBe('redirect-response');
    });
  });

  describe('Token validation edge cases', () => {
    it('should handle token with missing expiry', () => {
      const tokenWithoutExp = createValidToken({ exp: undefined });
      const request = createMockRequest('/dashboard', { admin_access_token: tokenWithoutExp });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(result).toBe('redirect-response');
    });

    it('should handle token with missing role', () => {
      const tokenWithoutRole = createValidToken({ role: undefined });
      const request = createMockRequest('/dashboard', { admin_access_token: tokenWithoutRole });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/unauthorized', request.url).toString());
      expect(result).toBe('redirect-response');
    });

    it('should handle token with invalid JSON in payload', () => {
      const invalidToken = 'header.invalid-json.signature';
      const request = createMockRequest('/dashboard', { admin_access_token: invalidToken });
      
      const result = middleware(request);
      
      const [[redirectUrl]] = mockRedirect.mock.calls;
      expect(redirectUrl.toString()).toBe(new URL('/login?returnTo=%2Fdashboard', request.url).toString());
      expect(result).toBe('redirect-response');
    });
  });

  describe('Different routes', () => {
    it('should protect nested admin routes', () => {
      const validToken = createValidToken();
      const request = createMockRequest('/admin/cars/create', { admin_access_token: validToken });
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should protect settings routes', () => {
      const validToken = createValidToken();
      const request = createMockRequest('/settings/profile', { admin_access_token: validToken });
      
      const result = middleware(request);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe('next-response');
    });

    it('should redirect unauthenticated users from any protected route', () => {
      const routes = ['/dashboard', '/cars', '/inquiries', '/settings', '/analytics'];
      
      routes.forEach(route => {
        // Clear mock calls before each iteration
        jest.clearAllMocks();
        mockNext.mockReturnValue('next-response');
        mockRedirect.mockReturnValue('redirect-response');
        
        const request = createMockRequest(route);
        
        const result = middleware(request);
        
        const [[redirectUrl]] = mockRedirect.mock.calls;
        expect(redirectUrl.toString()).toBe(new URL(`/login?returnTo=${encodeURIComponent(route)}`, request.url).toString());
        expect(result).toBe('redirect-response');
      });
    });
  });
});