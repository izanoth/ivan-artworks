import prisma from "lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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
    console.error("Erro ao buscar álbuns (admin):", error);
    return NextResponse.json({ error: "Erro ao buscar álbuns." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, year, genre, composer, coverImage, tracks } = body;

    if (!title) {
      return NextResponse.json({ error: "O título do álbum é obrigatório." }, { status: 400 });
    }

    let savedAlbum;

    if (id) {
      // Update existing album
      // First update album fields
      savedAlbum = await prisma.album.update({
        where: { id },
        data: {
          title,
          year: Number(year) || 2026,
          genre: genre || '',
          composer: composer || '',
          coverImage: coverImage || '',
        },
      });

      // Update tracks: simple strategy is delete existing tracks and recreate or upsert
      if (tracks && Array.isArray(tracks)) {
        await prisma.track.deleteMany({
          where: { albumId: id },
        });

        await prisma.track.createMany({
          data: tracks.map((t: any, idx: number) => ({
            albumId: id,
            title: t.title,
            src: t.src || null,
            software: Array.isArray(t.software) ? t.software : (t.software ? t.software.split(',').map((s: string) => s.trim()) : []),
            order: idx + 1,
          })),
        });
      }
    } else {
      // Create new album
      savedAlbum = await prisma.album.create({
        data: {
          title,
          year: Number(year) || 2026,
          genre: genre || '',
          composer: composer || '',
          coverImage: coverImage || '',
          tracks: {
            create: tracks && Array.isArray(tracks) ? tracks.map((t: any, idx: number) => ({
              title: t.title,
              src: t.src || null,
              software: Array.isArray(t.software) ? t.software : (t.software ? t.software.split(',').map((s: string) => s.trim()) : []),
              order: idx + 1,
            })) : [],
          },
        },
      });
    }

    revalidatePath('/music');
    revalidatePath('/admin/su/customize');

    const result = await prisma.album.findUnique({
      where: { id: savedAlbum.id },
      include: { tracks: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao salvar álbum:", error);
    return NextResponse.json({ error: error.message || "Erro ao salvar álbum." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido." }, { status: 400 });
    }

    // Soft delete album and its tracks
    await prisma.album.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.track.updateMany({
      where: { albumId: id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/music');
    revalidatePath('/admin/su/customize');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir álbum:", error);
    return NextResponse.json({ error: "Erro ao excluir álbum." }, { status: 500 });
  }
}
