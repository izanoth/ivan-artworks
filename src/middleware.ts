// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/auth";

interface TokenPayload {
  id: string;
  role: string;
}

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
    if (req.nextUrl.pathname.startsWith('/admin/editor')) {
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
    '/blog/crud/:path*',
    '/admin/su/:path*',
    '/admin/editor/:path*',
  ],
};



