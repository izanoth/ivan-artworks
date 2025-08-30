// /admin/api/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/auth";

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
      const token = await signToken({ id: username, role: "admin" });
      const res = NextResponse.json({ success: true, role: "admin" }, { status: 200 });

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

    const token = await signToken({ id: user.id, role: user.role });
    const res = NextResponse.json({ success: true, role: user.role }, { status: 200 });

    res.cookies.set("friend-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 horas
    });

    return res;
  } catch (err) {
    console.error("[ERROR] Erro no endpoint de login:", err);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
