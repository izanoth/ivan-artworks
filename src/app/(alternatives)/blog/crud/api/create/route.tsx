import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const authorId = formData.get("authorId")?.toString() || "";
	 const categoryId = Number(formData.get('categoryId'));    
    const content = formData.get("content")?.toString() || "";
    const published = formData.get("published") === "on" || formData.get("published") === "true";
		
    // cria post no banco
    const post = await prisma.post.create({
      data: { title, content, published, authorId, categoryId },
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
