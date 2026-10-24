import React from 'react';
import prisma from 'lib/prisma';

interface Post {
    id: string;
    title: string;
    content: string;
    category: {
        id: number;
        name: string;
    } | null;
    author: {
        name: string | null;
        email: string;
    } | null;
    source: string | null;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}

async function getBlogPosts(): Promise<Post[]> {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            include: {
                category: true,
                author: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return posts;
    } catch (error) {
        console.error("Failed to fetch blog posts from database:", error);
        return [];
    }
}

export default async function StaticBlogPage() {
    const posts = await getBlogPosts();

    return (
        <main className="p-8 font-sans max-w-4xl mx-auto bg-white text-gray-900 min-h-screen">
            <header className="mb-12 border-b pb-6">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Blog (Modo Estático / Rudimentar)</span>
                <h1 className="text-4xl font-bold mt-2">Publicações</h1>
                <p className="text-gray-600 mt-1">Leitura integral de artigos e posts em página única, sem necessidade de JavaScript.</p>
            </header>

            {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <strong>Nenhum post disponível</strong>
                    <p>Não existem publicações no momento.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-16">
                    {posts.map((post) => {
                        const authorName = post.author?.name || "Autor desconhecido";
                        const content = post.content ? post.content.replace(/\\n/g, "\n") : "";
                        const categoryName = post.category?.name || "Geral";

                        return (
                            <article key={post.id} className="border-b pb-12 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {categoryName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString("pt-BR")} por {authorName}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">{post.title}</h2>
                                <div className="prose text-gray-800 whitespace-pre-wrap leading-relaxed mt-2">
                                    {content}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
