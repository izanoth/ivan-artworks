import { NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET(_: Request, { params }: { params: { postId: string } }) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.postId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(comments);
}
