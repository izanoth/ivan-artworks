"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Novo hook de navegação para Next.js 13+
import ReactMarkdown from "react-markdown";
import Link from 'next/link';
import Comments from './Comments';

export type PostProps = {
    id: string;
    title: string;
    author: {
        name: string;
        email: string;
    } | null;
    content: string;
    source: string;
    image: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const PostDetail: React.FC<{ post: PostProps }> = ({ post }) => {
    const router = useRouter();
    const authorName = post.author ? post.author.name : "Unknown author";
    const content = post.content.replace(/\\n/g, "\n");
	console.log('source?: ', post.source);
    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8">
            <Link
                href="/blog"
                className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
            >
                <i className="fa fa-arrow-left mr-2"></i>
                Voltar
            </Link>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-left">{post.title}</h2>

            <div className="text-sm text-gray-500 mb-4 text-left">
                <span>Por {authorName}</span> | <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-center">
                {post.image && (
                    <img
                        src={post.image}
                        alt={post.title}
                        width={400}
                        height={400}
                        className="mb-4 rounded-xl"
                    />
                )}
            </div>
            <div className="w-full text-left prose-lg prose-p:my-4 text-gray-700">
                <ReactMarkdown>
                    { content }                    
                </ReactMarkdown>
                { post.source && (<i className="pb-2">Fonte: <a href={post.source}>{post.source}</a></i>) }
            </div>
            <Comments postId={post.id} />
        </div>
    );
};

export default PostDetail;
