import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID ausente" },
        { status: 400 }
      );
    }

    const where: any = {};
    if (!isNaN(Number(id))) {
      where.id = Number(id);
    } else {
      where.id = String(id);
    }

    await prisma.post.delete({ where });

    return NextResponse.json({ message: "Post deletado com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Erro ao deletar post" },
      { status: 500 }
    );
  }
};
