// File: src/app/api/blog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { cookies } from 'next/headers';

interface Post {
    id: string;
    title: string;
    categoryId: number;
    postRequest: boolean | null;
	 category?: {
	   id: number;
	   name: string;
	 };
    content: string;
    author: {
        name: string | null;
        email: string | null;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}

type Role = 'admin' | 'editor' | 'user' | 'guest'

function getAuthFromRequest(req: NextRequest): { role: Role; username: string | null } {
  const role = (req.cookies.get('role')?.value as Role) || 'guest';
  const username = req.cookies.get('username')?.value || null;
  return { role, username };
}

export async function GET(req: NextRequest) {
  try {
    const { role, username } = getAuthFromRequest(req);

    // Regras de visibilidade
    let where: any = {};
    if (role === 'admin') {
      // nada: vê tudo
      where = {};
    } else if (role === 'editor' && username) {
      where = {
        OR: [
          { authorId: username },
        ],
      }
    } else {
      // público
      where = { published: true }
    }

    /* Query params (EM DESENVOLVIMENTO) *************************
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    if (categoryId) {
      where = { AND: [where, { categoryId: Number(categoryId) }] }
    }
    **************************************************************/

    /* Paginação simples (opcional): ?page=1&limit=10
    const page = Number(searchParams.get('page') || '1')
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit*/

    const posts = await prisma.post.findMany({
        where,
        include: {
          category: true,
          author: true,
        },
        orderBy: { createdAt: 'desc' },
     });

     return NextResponse.json(posts as Post[]);
  } catch (err) {
    console.error('GET /api/blog error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


// Opcional: forçar dinamismo se usar caching agressivo
export const dynamic = 'force-dynamic';
