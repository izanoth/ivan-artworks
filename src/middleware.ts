// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/auth';

export function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin');

  if (isAdminPath) {
      const token = req.cookies.get('admin-auth')?.value;

      try {
        if (!token) throw new Error('No token');
        verifyToken(token); // lança erro se inválido
        return NextResponse.next(); // autorizado
      } catch (err) {
        // redireciona se token ausente ou inválido
        return NextResponse.redirect(
          new URL('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773', req.url)
        );
      }
    }

  // para todas as outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin',
    '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/:path*'
  ],
};
