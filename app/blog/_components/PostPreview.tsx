"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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

type PostPreviewProps = {
  post: PostProps;
  showFullContent?: boolean;
};

const PostPreview: React.FC<PostPreviewProps> = ({ post, showFullContent = false }) => {
  const router = useRouter();
  const authorName = post.author ? post.author.name : "Unknown author";

  // Função para gerar o resumo do conteúdo
  const getContentSummary = (content: string) => {
    const words = content.split(" ");
    return words.length > 20 ? words.slice(0, 20).join(" ") + "..." : content; // Limite de 20 palavras
  };

  return (

    <div className="container max-w-screen-xl mx-auto p-8">
      <div
        className="flex flex-col gap-6 cursor-pointer overflow-y-auto"
        onClick={() => router.push(`/blog/p/${post.id}`)}
      >
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{post.title}</h2>
          <small className="text-gray-600 mb-4 block">By {authorName}</small>
          <ReactMarkdown className="text-gray-700">
            {showFullContent ? post.content : getContentSummary(post.content)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
