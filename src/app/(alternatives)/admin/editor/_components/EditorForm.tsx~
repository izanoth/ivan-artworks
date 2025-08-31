"use client";

import { useState } from "react";
import prisma from "@/prisma";
import crypto from "crypto";

interface Post {
  id: string;
  categoryId: number | null;
  authorId: string | null;
  title: string;
  content: string;
  image: string | null;
  published: boolean;
  category: {
 	  id: number;
	  name: string;
  } | null;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  initialPosts: Post[];
  categories: Category[];
  authorId: string;
}

export default function EditorForm({ initialPosts, categories, authorId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

   const res = await fetch("/admin/blog/api/create", {
	  method: "POST", 
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
	    title,
	    authorId,
	    content,
	    published: true,
	    categoryId: categoryId,
	  }),
	 });
    
	 const newPostData = await res.json();
    
    setPosts([newPostData, ...posts]);

    setTitle("");
    setContent("");
    setCategoryId("");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-neon space-y-4"
      >
        <input
          type="text"
          placeholder="Título do post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />
        <textarea
          placeholder="Conteúdo do post"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows={6}
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full p-3 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        >
          <option value="">Selecione a categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold transition-colors"
        >
          {loading ? "Salvando..." : "Criar Post"}
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 bg-gray-800 rounded-2xl shadow-neon flex flex-col space-y-2 hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-neon-cyan">{post.title}</h2>
            {post.category && (
              <span className="text-sm text-gray-400">Categoria: {post.category.name}</span>
            )}
            <p className="text-gray-300">{post.content}</p>
            <span
              className={`self-start px-3 py-1 rounded-full font-semibold ${
                post.published ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {post.published ? "Publicado" : "Rascunho"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
