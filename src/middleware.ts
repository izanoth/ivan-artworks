// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/auth';

export function middleware(req: NextRequest) {

	  if (req.nextUrl.pathname.startsWith('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin')) {
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
     // Rotas editor
    if (req.nextUrl.pathname.startsWith('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/editor')) {
		  const token =
		    req.cookies.get('friend-auth')?.value ??
		    req.cookies.get('admin-auth')?.value;
		
		  try {
		    if (!token) throw new Error('No token');
		    verifyToken(token);
		    return NextResponse.next(); // autorizado
		  } catch (err) {
		    return NextResponse.redirect(
		      new URL('/c5233bb9-ba20-4b8e7-8ed79c849773', req.url)
		    );
		  }
        return NextResponse.next();
    }

  // para todas as outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/blog/crud/:path*',
    '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/:path*',
    '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/editor/:path*',
  ],
};



