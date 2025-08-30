// app/api/user/newuser/route.ts
// app/api/users/route.ts
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateRandomPassword(length = 12) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

export async function POST(req: Request) {
  try {
    const { name, email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email e role são obrigatórios." },
        { status: 400 }
      );
    }

    // gera a senha automaticamente
    const plainPassword = generateRandomPassword();

    // gera hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    // retorna a senha gerada para envio ao usuário
    return NextResponse.json({ ...user, plainPassword }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar usuário." },
      { status: 500 }
    );
  }
}
