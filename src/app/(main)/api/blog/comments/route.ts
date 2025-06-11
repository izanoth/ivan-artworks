import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import admin from '@/firebase-admin';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newComment = await prisma.comment.create({
    data: {
      postId: body.postId,
      guestName: body.guestName || 'Visitante',
      text: body.text,
    },
  });

/**************
FIREBASE
************/
  /* Exemplo de token de dispositivo (em produção, você buscaria isso do banco)
  const deviceToken = 'TOKEN_DO_DISPOSITIVO'; // Substituir

  const message = {
    notification: {
      title: 'Novo comentário!',
      body: `${newComment.guestName} comentou: ${newComment.text}`,
    },
    token: deviceToken,
  };

  try {
    await admin.messaging().send(message);
    console.log('Notificação enviada!');
  } catch (err) {
    console.error('Erro ao enviar notificação:', err);
  }*/
  
  return NextResponse.json(newComment);
}
