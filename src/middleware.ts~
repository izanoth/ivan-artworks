// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // protege rotas admin
  if (pathname.startsWith('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin')) {
    const token = req.cookies.get('admin-auth')?.value;

    try {
      if (!token) throw new Error('No token');
      verifyToken(token); // lança erro se inválido
      return NextResponse.next(); // autorizado
    } catch (err) {
      return NextResponse.redirect(
        new URL('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773', req.url)
      );
    }
  }

  // demais rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/blog/crud/:path*',
    '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/:path*'
  ],
};
