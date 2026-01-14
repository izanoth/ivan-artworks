"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from 'next/link';

export type PostProps = {
  id: string;
  title: string;
  category: {
  	 id: number;
  	 name: string;
  } | null;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  source: string;
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
  const content = post.content.replace(/\\n/g, "\n");
  
  // Função para gerar o resumo do conteúdo
  const getContentSummary = (content: string) => {
    const words = content.split(" ");
    return words.length > 20 ? words.slice(0, 20).join(" ") + "..." : content; // Limite de 20 palavras
  };

  const categoryColors: Record<string, { badge: string; bgGradient: string }> = {
    news: { badge: "bg-yellow-300 text-yellow-800", bgGradient: "from-yellow-50 to-white" },
    cultura: { badge: "bg-blue-300 text-blue-800", bgGradient: "from-blue-50 to-white" },
    tecnologia: { badge: "bg-green-300 text-green-800", bgGradient: "from-green-50 to-white" },
    sociedade: { badge: "bg-red-300 text-red-800", bgGradient: "from-red-50 to-white" },
    poder: { badge: "bg-purple-300 text-purple-800", bgGradient: "from-purple-50 to-white" },
    educação: { badge: "bg-pink-300 text-pink-800", bgGradient: "from-pink-50 to-white" },
    moral: { badge: "bg-orange-300 text-orange-800", bgGradient: "from-orange-50 to-white" },
    default: { badge: "bg-gray-300 text-gray-800", bgGradient: "from-gray-50 to-white" },
  };



  const categoryName = post.category?.name?.toLowerCase().split(" ")[0] || "default";
  const categoryStyles = categoryColors[categoryName] || categoryColors.default;

  return (
    <div className="container max-w-screen-xl mx-auto p-8">
      <Link href={`/blog/p/${post.id}`}>
        <div className="flex flex-col gap-6 cursor-pointer overflow-y-auto">
          <div
            className={`border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 ease-in-out relative bg-gradient-to-br ${categoryStyles.bgGradient}`}
          >
            {/* Nome da categoria no canto superior esquerdo */}
            {post.category?.name && (
              <span
                className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${categoryStyles.badge}`}
              >
                {post.category.name}
              </span>
            )}

            <h2 className="text-2xl font-bold text-gray-800 max-width-200 mb-6 mt-8">
              {post.title}
            </h2>
            <small className="text-gray-600 mb-4 block">By {authorName}</small>
            <ReactMarkdown className="text-gray-700 max-width-200">
              {showFullContent ? content : getContentSummary(content)}
            </ReactMarkdown>
          </div>
        </div>
      </Link>
    </div>
  );
};


export default PostPreview;
