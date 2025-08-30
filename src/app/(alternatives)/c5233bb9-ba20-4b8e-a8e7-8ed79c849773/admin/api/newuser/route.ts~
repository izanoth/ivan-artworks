// app/api/users/route.ts
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email e role são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar usuário." },
      { status: 500 }
    );
  }
}
