import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      where: { deletedAt: null },
      include: {
        tracks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { year: 'desc' },
    });
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Erro ao buscar álbuns:", error);
    return NextResponse.json({ error: "Erro ao buscar álbuns." }, { status: 500 });
  }
}
