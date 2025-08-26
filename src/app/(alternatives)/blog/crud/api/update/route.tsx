import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.formData();

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: data.get("title") as string,
        content: data.get("content") as string,
        authorId: data.get("authorId") as string,
        published: data.get("published") === "on",
        image: data.get("image") ? (data.get("image") as string) : undefined,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar post" }, { status: 500 });
  }
}
