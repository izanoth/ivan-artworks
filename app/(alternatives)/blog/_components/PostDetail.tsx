"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Novo hook de navegação para Next.js 13+
import ReactMarkdown from "react-markdown";
import Link from 'next/link';

export type PostProps = {
    id: string;
    title: string;
    author: {
        name: string;
        email: string;
    } | null;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const PostDetail: React.FC<{ post: PostProps }> = ({ post }) => {
    const router = useRouter();
    const authorName = post.author ? post.author.name : "Unknown author";
    

    return (
        <div className="container bg-white shadow-md rounded-lg p-6 mb-4">
             <Link href="/blog" 
                className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
            >
                <i className="fa fa-arrow-left"></i>
                Voltar
            </Link>
            <h2 className="text-xl text-left font-bold text-gray-800 mb-2">{post.title}</h2>
            <div className="text-sm text-left text-gray-500 mb-4">
                <span>By {authorName}</span> | <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose prose-sm text-gray-700">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default PostDetail;