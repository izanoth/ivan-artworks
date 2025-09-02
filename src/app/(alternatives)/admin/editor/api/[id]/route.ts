import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma'
import { verifyToken } from "@/auth";
import { cookies } from "next/headers";

async function getAuthFromRequest(req: NextRequest): Promise<{ role: Role; username: string | null }> {
  const cookieStore = cookies(); 
  const adminAuth = await verifyToken(cookieStore.get("admin-auth")?.value);
  const friendAuth = await verifyToken(cookieStore.get("friend-auth")?.value);
  const auth = adminAuth || friendAuth;
  return { role: auth?.role, username: auth?.username ?? null };
}

// ===================================================
// GET /admin/editor/api/[id] → pegar um post
// ===================================================
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { role, username } = getAuthFromRequest(req)
  const postId = params.id

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { category: true }, // ajuste conforme seu schema
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Regras de acesso
    if (role === 'admin') {
      return NextResponse.json(post)
    }

    if (role === 'editor') {
      if (post.published || post.authorId === username) {
        return NextResponse.json(post)
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Público → só publicado
    if (post.published) {
      return NextResponse.json(post)
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (err) {
    console.error('GET /api/blog/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// ===================================================
// PUT /admin/editor/api/[id] → atualizar post
// ===================================================

export async function PUT(req: NextRequest,  { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest();
  const postId = params.id;
	console.log('put: ', auth);
  if (auth.role === 'guest' || !auth.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
	 
	 const user = await prisma.user.findUnique({
		  where: { email: auth.username },
	 });
		
	 const authorId = user?.id;
	 
    // Autorização: editores só podem atualizar seus próprios posts
    if (post.authorId !== authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title ?? post.title,
        content: data.content ?? post.content,
        published: data.published ?? post.published,
        categoryId: data.categoryId ?? post.categoryId,

        /* Se admin enviar approve = true, publica o post [ EM PATCH ]
        ...(auth.role === 'admin' && data.approve
          ? { published: true }
          : {}),*/
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /api/blog/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


// ===================================================
// DELETE /admin/editor/api/[id] → remover post
// ===================================================
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest();
  const postId = params.id

  if(!auth.role) {
	 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }	
	
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
	 const user = await prisma.user.findUnique({
		  where: { email: auth.username },
	 });		
	 const authorId = user?.id;
    if (post.authorId !== authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /admin/editor/api/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // mesma lógica de autorização do PUT
  const auth = await getAuthFromRequest();
  const postId = params.id

  if (auth.role === 'guest' || !auth.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Autorização
    if (auth.role !== 'admin' && post.authorId !== auth.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    const updated = await prisma.post.update({
      where: { id: postId },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /admin/editor/api/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

