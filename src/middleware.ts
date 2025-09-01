// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/auth";

export function middleware(req: NextRequest) {

	  if (req.nextUrl.pathname.startsWith('/admin/su')) {
	   const token = req.cookies.get('admin-auth')?.value;

      try {
        if (!token) throw new Error('No token');
        verifyToken(token); // lança erro se inválido
        return NextResponse.next(); // autorizado
      } catch (err) {
        return NextResponse.redirect(
          new URL('/admin', req.url)
        );
      }
    }
     // Rotas editor
    if (req.nextUrl.pathname.startsWith('/admin/editor') || req.nextUrl.pathname.startsWith('/admin/blog/')) {
		  const token =
		    req.cookies.get('friend-auth')?.value ??
		    req.cookies.get('admin-auth')?.value;
		
		  try {
		    if (!token) throw new Error('No token');
		    verifyToken(token);
		    return NextResponse.next(); // autorizado
		  } catch (err) {
		    return NextResponse.redirect(
		      new URL('/admin', req.url)
		    );
		  }
        return NextResponse.next();
    }

  // para todas as outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/su/:path*',
    '/admin/blog/:path*',
    '/admin/editor/:path*',
  ],
};



