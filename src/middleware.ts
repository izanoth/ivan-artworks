import { NextRequest, NextResponse } from "next/server";
import { verifyNearSession, verifyToken } from "@/auth";

function isMutatingApiRequest(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method.toUpperCase();

  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return false;
  }

  return (
    pathname.startsWith('/api/marketplace') ||
    pathname.startsWith('/api/collections') ||
    pathname.startsWith('/api/tokens')
  );
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // Check for inactive pages
  const publicPages = ['/music', '/prog', '/marketplace', '/blog', '/guestbook', '/whoami', '/contact'];
  const matchedPage = publicPages.find((page) => pathname === page || pathname.startsWith(page + '/'));

  if (matchedPage) {
    try {
      const statusUrl = new URL('/api/public/pages-status', req.url);
      const res = await fetch(statusUrl.toString());
      if (res.ok) {
        const { inactiveSlugs } = await res.json();
        if (Array.isArray(inactiveSlugs) && inactiveSlugs.includes(matchedPage)) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    } catch (e) {
      console.error("Middleware check failed:", e);
    }
  }

  if (isMutatingApiRequest(req)) {
    const token = req.cookies.get('near-auth')?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'NEAR session required for mutating requests.' },
        { status: 401 },
      );
    }

    const payload = verifyNearSession(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired NEAR session.' },
        { status: 401 },
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/admin/su') || pathname.startsWith('/admin/studio') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('admin-auth')?.value;

    try {
      if (!token) throw new Error('No token');
      verifyToken(token);
      return NextResponse.next();
    } catch (err) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL('/admin', req.url)
      );
    }
  }

  if (pathname.startsWith('/admin/editor') || pathname.startsWith('/admin/blog/')) {
    const token =
      req.cookies.get('friend-auth')?.value ??
      req.cookies.get('admin-auth')?.value;

    try {
      if (!token) throw new Error('No token');
      verifyToken(token);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(
        new URL('/admin', req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/marketplace',
    '/marketplace/:path*',
    '/blog',
    '/blog/:path*',
    '/admin/su/:path*',
    '/admin/su',
    '/admin/studio/:path*',
    '/admin/studio',
    '/admin/blog/:path*',
    '/admin/editor/:path*',
    '/api/marketplace/:path*',
    '/api/collections/:path*',
    '/api/tokens/:path*',
    '/api/marketplace',
    '/api/collections',
    '/api/tokens',
    '/api/admin/:path*',
    '/music',
    '/music/:path*',
    '/prog',
    '/prog/:path*',
    '/guestbook',
    '/guestbook/:path*',
    '/whoami',
    '/whoami/:path*',
    '/contact',
    '/contact/:path*',
  ],
};
