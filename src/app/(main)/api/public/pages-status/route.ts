import prisma from "lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inactivePages = await prisma.page.findMany({
      where: { isActive: false },
      select: { slug: true }
    });
    return NextResponse.json({ inactiveSlugs: inactivePages.map((p) => p.slug) });
  } catch (error) {
    console.error("Erro ao buscar status das páginas:", error);
    return NextResponse.json({ inactiveSlugs: [] }, { status: 500 });
  }
}
