// File: src/app/api/post/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export const runtime = "nodejs"; /************/
export const dynamic = "force-dynamic";


interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        name: string | null;
        email: string | null;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return NextResponse.json(posts as Post[]);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.error();
    }
}


export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const authorId = formData.get("authorId")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const published = formData.get("published") === "on" || formData.get("published") === "true";

    // cria post no banco
    const post = await prisma.post.create({
      data: { title, content, published, authorId },
    });

    // notifica hub
    const hubUrl = "https://pubsubhubbub.appspot.com/";
    const feedUrl = "https://zanoth.vercel.app/blog/feed.xml";
    fetch(hubUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "hub.mode": "publish",
        "hub.url": feedUrl,
      }),
    }).catch(console.error);

    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro ao criar post" }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, post });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir post" }, { status: 500 });
  }
}

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




