import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { pusherServer } from '@/pusher';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newComment = await prisma.comment.create({
    data: {
      postId: body.postId,
      guestName: body.guestName || 'Visitante',
      text: body.text,
    },
  });

  await pusherServer.trigger('comments', 'new-comment', newComment);

  return NextResponse.json(newComment);
}
