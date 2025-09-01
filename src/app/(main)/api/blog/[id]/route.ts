import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma'

// ===================================================
// GET /api/blog/[id] → pegar um post público
// ===================================================
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const postId = params.id

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { category: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
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