import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CSRF Token Storage (in-memory for now, should be Redis in production)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

// Generate CSRF token
function generateCsrfToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token
function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored || stored.token !== token || stored.expiresAt < Date.now()) {
    return false;
  }
  return true;
}

// Store CSRF token
function storeCsrfToken(sessionId: string, token: string): void {
  csrfTokens.set(sessionId, {
    token,
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
  });
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // CSRF Protection for API mutations
  if (pathname.startsWith('/qdata/api/') && 
      (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
    
    // Skip CSRF check for initial setup and login
    if (pathname.includes('/auth/setup') || pathname.includes('/auth/login')) {
      // Allow these through
    } else {
      // Check CSRF token
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionCookie = request.cookies.get('qdata_session')?.value;

      if (!csrfToken || !sessionCookie) {
        return NextResponse.json(
          { error: 'CSRF token missing or invalid' },
          { status: 403 }
        );
      }

      if (!validateCsrfToken(sessionCookie, csrfToken)) {
        return NextResponse.json(
          { error: 'CSRF token invalid or expired' },
          { status: 403 }
        );
      }
    }
  }

  // Generate and set CSRF token for GET requests
  if (request.method === 'GET' && pathname.startsWith('/qdata')) {
    const sessionCookie = request.cookies.get('qdata_session')?.value;
    if (sessionCookie) {
      const csrfToken = generateCsrfToken();
      storeCsrfToken(sessionCookie, csrfToken);
      response.headers.set('X-CSRF-Token', csrfToken);
    }
  }

  // Force HTTPS in production (but not on localhost)
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host');
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
    
    if (!isLocalhost) {
      const proto = request.headers.get('x-forwarded-proto');
      if (proto && proto !== 'https') {
        return NextResponse.redirect(
          `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
          301 // Permanent redirect
        );
      }
    }
  }

  // Security Headers
  const headers = response.headers;

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  headers.set('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval/inline
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // HSTS - Force HTTPS for 1 year (but not on localhost)
  if (process.env.NODE_ENV === 'production') {
    const host = request.headers.get('host');
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
    
    if (!isLocalhost) {
      headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
  }

  // Referrer Policy - Don't leak URLs
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy - Disable unnecessary features
  headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  );

  // Remove server identification
  headers.delete('X-Powered-By');
  headers.delete('Server');

  // Add security-focused custom headers
  headers.set('X-Security-Level', 'Enterprise');
  headers.set('X-Protected-By', 'QData');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
