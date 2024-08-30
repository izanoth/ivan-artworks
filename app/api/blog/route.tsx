// File: src/app/api/post/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

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
    /* return posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author ? {
            name: post.author.name,
            email: post.author.email,
        } : null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        published: post.published,
    })); */
}
/* export async function GET() {
    try {
        const posts = await prisma.post.findMany();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.error();
    }
} */

export async function POST(request: NextRequest) {
    try {
        const { title, content, author } = await request.json();
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                author,
            },
        });
        return NextResponse.json(newPost);
    } catch (error) {
        console.log('Error creating post:', error);
        return NextResponse.error();
    }
}
