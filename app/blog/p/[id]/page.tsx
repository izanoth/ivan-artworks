import React from "react";
import PostDetail, { PostProps } from "@/blog/components/PostDetail";
import prisma from "@/prisma";
import RootLayout from "@rootLayout";
import Header from '@/blog/layout/Header';

// Definição do tipo PageProps
type PageProps = {
    params: {
        id: string;
    };
};

// Atualizando o tipo para corresponder à estrutura esperada
type PostWithRelations = {
    id: string;
    title: string;
    content: string | null;
    published: boolean;
    author: {
        name: string;
        email: string | null; // Permite que email seja null
    } | null;
    authorId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

// Função assíncrona para buscar dados do post
async function getPostData(id: string): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            author: { select: { name: true, email: true } }, // Inclua o email se necessário
        },
    });

    if (!post) return null;

    // Ajuste a estrutura do objeto para corresponder a PostProps
    return {
        id: post.id,
        title: post.title,
        content: post.content || '',
        published: post.published,
        author: post.author ? {
            name: post.author.name || 'Unknown',
            email: post.author.email || null, // Permite null
        } : null,
        authorId: post.authorId || null,
        createdAt: post.createdAt, // Incluindo campos adicionais
        updatedAt: post.updatedAt, // Incluindo campos adicionais
    };
}

// Função do servidor para buscar os dados do post com base na rota
export async function generateMetadata({ params }: PageProps) {
    const post = await getPostData(params.id);
    return { title: post?.title || "Post Not Found" };
}

// Componente principal da página
const PostPage = async ({ params }: PageProps) => {
    const post = await getPostData(params.id);

    if (!post) {
        return <div>Post not found</div>
    }

    // Passa o post tipado corretamente como PostProps
    return (
        <RootLayout header={Header}>
            <div className="container">
                <PostDetail post={post as PostProps} />
            </div>
        </RootLayout>
    )
};

export default PostPage;
