// /api/user/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/auth";
import { cookies } from 'next/headers';

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha obrigatórios" },
        { status: 400 }
      );
    }

    // Admin via env
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASS;

    if (username === 'izanoth' && password === adminPassword) {
      const token = await signToken({ username });
      
      const res = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Token': token,
        },
      });
      
      res.cookies.set("admin-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 2, // 2 horas
      });      
      
      return res;
    }

    // Usuário comum
    const user = await prisma.user.findFirst({
      where: { email: username },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = await signToken({ username: user.email });
    const res = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Token': token,
     	},
    });
    res.cookies.set("friend-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 horas
    });

    return res;
    
        console.warn('[WARN] Credenciais inválidas');
    return NextResponse.json({ success: false, username }, { status: 401 });
    
  } catch (err) {
    console.error("[ERROR] Erro no endpoint de login:", err);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
