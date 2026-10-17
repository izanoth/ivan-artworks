import prisma from "lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        name: { not: 'footer' }
      },
      include: {
        contents: {
          where: { deletedAt: null },
          orderBy: { version: 'desc' },
        }
      },
      orderBy: { order: 'asc' }
    });

    const footerPage = await prisma.page.findUnique({
      where: { name: 'footer' },
      include: {
        contents: {
          where: { deletedAt: null },
          orderBy: { version: 'desc' }
        }
      }
    });

    const footerItems = await prisma.footerItem.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' }
    });

    const footerText = footerPage?.contents[0]?.body || 'Zanoth © Independent Artworks 2023-25. All Rights Reserved.';

    return NextResponse.json({ pages, footerItems, footerText });
  } catch (error) {
    console.error("Erro ao buscar customizações:", error);
    return NextResponse.json({ error: "Erro ao buscar dados de customização." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, id, data } = body;

    // 1. Atualizar ativação / propriedades da Página
    if (type === 'page') {
      const updatedPage = await prisma.page.update({
        where: { id },
        data: { 
          isActive: data.isActive,
          name: data.name,
          order: data.order,
          type: data.type
        }
      });

      revalidatePath('/', 'layout');
      return NextResponse.json(updatedPage);
    }

    // 2. Modificar conteúdo de texto (adiciona nova linha/versão no banco de dados)
    if (type === 'content') {
      const { pageId, locale, body: contentBody } = data;

      // Buscar última versão existente para incrementar
      const latest = await prisma.content.findFirst({
        where: { pageId, locale, deletedAt: null },
        orderBy: { version: 'desc' }
      });

      const nextVersion = (latest?.version || 0) + 1;

      // Criação de nova linha no banco de dados com versionamento (sem sobrescrever a anterior)
      const newContent = await prisma.content.create({
        data: {
          pageId,
          locale,
          body: contentBody,
          version: nextVersion
        }
      });

      revalidatePath('/', 'layout');
      return NextResponse.json(newContent);
    }

    // 3. Atualizar ou Criar Item do Footer (ícone/link)
    if (type === 'footerItem') {
      if (id) {
        const updated = await prisma.footerItem.update({
          where: { id },
          data: {
            text: data.text,
            link: data.link,
            iconClass: data.iconClass,
            order: data.order !== undefined ? Number(data.order) : 0,
            isActive: data.isActive
          }
        });
        revalidatePath('/', 'layout');
        return NextResponse.json(updated);
      } else {
        const created = await prisma.footerItem.create({
          data: {
            text: data.text,
            link: data.link,
            iconClass: data.iconClass,
            order: data.order !== undefined ? Number(data.order) : 0,
            isActive: data.isActive ?? true
          }
        });
        revalidatePath('/', 'layout');
        return NextResponse.json(created);
      }
    }

    // 4. Atualizar texto geral / copyright do Footer (também versionado no banco)
    if (type === 'footerText') {
      let footerPage = await prisma.page.findUnique({
        where: { name: 'footer' }
      });

      if (!footerPage) {
        footerPage = await prisma.page.create({
          data: {
            name: 'footer',
            slug: '/footer',
            isActive: true,
            order: 99,
            type: 'footer'
          }
        });
      }

      const latest = await prisma.content.findFirst({
        where: { pageId: footerPage.id, locale: 'pt', deletedAt: null },
        orderBy: { version: 'desc' }
      });

      const nextVersion = (latest?.version || 0) + 1;

      const newContent = await prisma.content.create({
        data: {
          pageId: footerPage.id,
          locale: 'pt',
          body: data.text,
          version: nextVersion
        }
      });

      revalidatePath('/', 'layout');
      return NextResponse.json(newContent);
    }

    return NextResponse.json({ error: "Tipo de operação inválido." }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de customização:", error);
    return NextResponse.json({ error: "Erro ao processar atualização." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (type === 'footerItem' && id) {
      // Soft-delete: nunca deletamos fisicamente
      await prisma.footerItem.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      revalidatePath('/', 'layout');
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Requisição de exclusão inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    return NextResponse.json({ error: "Erro ao excluir item." }, { status: 500 });
  }
}
