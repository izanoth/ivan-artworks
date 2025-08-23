// app/blog/crud/page.tsx
import prisma from "@/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, signToken } from "@/auth";

export default async function BlogCrudPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin-auth")?.value;

  if (!token) {
    redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773");
  }
  
  try { 
    verifyToken(token); 
  }  catch { 
    redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773"); 
  }

  // Puxar posts do banco
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Blog CRUD</h1>

      {/* Formulário de criação */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Nova Postagem</h2>
        <form action="/api/blog/posts" method="post" encType="multipart/form-data" className="flex flex-col gap-4">
          <input type="text" name="title" placeholder="Título" className="border p-2 rounded" required />
         
          <input type="text" name="authorId" placeholder="ID do Autor" className="border p-2 rounded" value="" />

          <textarea name="content" placeholder="Conteúdo" className="border p-2 rounded min-h-[120px]" />
          <input type="file" name="image" className="border p-2 rounded" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" />
            Publicar imediatamente
          </label>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar Post</button>
        </form>
      </section>

      {/* Lista de posts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Postagens Existentes</h2>
        <ul className="flex flex-col gap-4">
          {posts.map(post => (
            <li key={post.id} className="border p-4 rounded flex flex-col md:flex-row md:justify-between">
              <div>
                <h3 className="font-bold">{post.title}</h3>
                {post.image && <img src={post.image} alt={post.title} className="max-w-xs mt-2" />}
                <p>{post.content}</p>
                <p className="text-sm text-gray-500">Publicado: {post.published ? "Sim" : "Não"}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

