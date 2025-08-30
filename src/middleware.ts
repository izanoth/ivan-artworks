// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/auth";

interface TokenPayload {
  id: string;
  role: string;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    // Rotas admin
    if (pathname.startsWith("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin")) {
      const token = req.cookies.get("admin-auth")?.value;
      if (!token) throw new Error("No admin token");
      const payload = verifyToken(token) as TokenPayload | null;
		if (!payload || payload.role !== "admin") {
		  throw new Error("Não autorizado");
		}
		console.log('payload.role')
      if (payload.role !== "admin") throw new Error("Não autorizado");
      return NextResponse.next();
    }

    // Rotas editor
    if (pathname.startsWith("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/editor")) {
      const token = req.cookies.get("friend-auth")?.value;
      if (!token) throw new Error("No friend-auth token");
      const payload = verifyToken(token) as TokenPayload | null;
		if (!payload || (payload.role !== "editor" && payload.role !== "admin")) {
		  throw new Error("Não autorizado");
		}
      return NextResponse.next();
    }

  } catch (err) {
    console.warn("[Middleware] Acesso negado:", err);
    return NextResponse.redirect(new URL("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773", req.url));
  }

  // Demais rotas públicas
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/blog/crud/:path*",
    "/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/:path*",
    "/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/editor/:path*",
  ],
};
