import { NextResponse } from "next/server";
import prisma from "@/prisma";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer"; // opcional, Buffer já é global

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // salva arquivo se houver
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const folderPath = path.join(process.cwd(), "public/images/posts", post.id);
      fs.mkdirSync(folderPath, { recursive: true });

      const filePath = path.join(folderPath, "cover.png");
      fs.writeFileSync(filePath, buffer);

      await prisma.post.update({
        where: { id: post.id },
        data: { image: `/images/posts/${post.id}/cover.png` },
      });
    }

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

