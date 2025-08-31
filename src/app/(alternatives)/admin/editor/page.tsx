// app/su/editor/page.tsx
"use client";

import { useState, useEffect } from "react";
import prisma from "@/prisma";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  published: boolean;
  categoryName?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function EditorPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);


  const posts = prisma.post.findMany({
  where: email = getcookie *(***********)
  }
  )
   const categories = prisma.category.findMany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/", { *************
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      setTitle("");
      setContent("");
      setImage("");
      fetchPosts();
    }

    setLoading(false);
  };

 return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-neon-pink drop-shadow-neon">
        Painel do Editor
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-gray-800 p-6 rounded-2xl shadow-neon space-y-4"
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
          className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
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

      {/* Lista de Posts */}
      <div className="mt-10 w-full max-w-4xl space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-6 bg-gray-800 rounded-2xl shadow-neon flex flex-col space-y-2 hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-bold text-neon-cyan">{post.title}</h2>
            {post.categoryName && (
              <span className="text-sm text-gray-400">Categoria: {post.categoryName}</span>
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
