// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin');
  const isLoggedIn = req.cookies.get('admin-auth')?.value === 'true';

  if (isAdminPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/:path*'],
};
