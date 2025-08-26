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
    image: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const PostDetail: React.FC<{ post: PostProps }> = ({ post }) => {
    const router = useRouter();
    const authorName = post.author ? post.author.name : "Unknown author";
    const content = post.content.replace(/\\n/g, "\n");

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
                <ReactMarkdown
                    components={{
                        p: ({ node, ...props }) => <p className="text-justify w-full">{props.children}</p>,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-2">{props.children}</h1>,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-5 mb-2">{props.children}</h2>,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1">{props.children}</ul>,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1">{props.children}</ol>,
                        li: ({ node, ...props }) => <li>{props.children}</li>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            <Comments postId={post.id} />
        </div>
    );
};

export default PostDetail;
