// src/app/(main)/api/blog/posts/route.ts
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import formidable, { File } from "formidable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // criar função utilitária para promisificar formidable
  const parseForm = (req: Request) =>
    new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      const form = formidable({ keepExtensions: true });
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { fields, files } = await parseForm(req);

    const title = fields.title as string;
    const authorId = fields.authorId as string;
    const content = fields.content as string;
    const published = fields.published === "true" || fields.published === "on";

    // criar post no banco
    const post = await prisma.post.create({
      data: { title, content, published, authorId },
    });

    // salvar imagem se existir
    if (files.image) {
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      const folderPath = path.join(process.cwd(), "public/images/posts", post.id);
      fs.mkdirSync(folderPath, { recursive: true });

      const filePath = path.join(folderPath, "cover.png");
      const data = fs.readFileSync((file as File).filepath);
      fs.writeFileSync(filePath, data);

      const imageUrl = `/images/posts/${post.id}/cover.png`;
      await prisma.post.update({ where: { id: post.id }, data: { image: imageUrl } });
    }

    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Erro ao criar post" }, { status: 500 });
  }
}

