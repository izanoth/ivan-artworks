// app/blog/crud/page.tsx
import prisma from "@/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/auth";
import DeletePost from "@/blog/components/DeletePost";

export default async function BlogCrudPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin-auth")?.value;

  if (!token) redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773");

  try {
    verifyToken(token);
  } catch {
    redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773");
  }

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Blog CRUD</h1>
		<section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Nova Postagem</h2>
        <form
          action="/blog/crud/api/create"
          method="post"
          encType="multipart/form-data"
          className="flex flex-col gap-4"
        >
          <input type="text" name="title" placeholder="Título" className="border p-2 rounded" required />
          <input type="text" name="authorId" placeholder="ID do Autor" className="border p-2 rounded" required />
          <textarea name="content" placeholder="Conteúdo" className="border p-2 rounded min-h-[120px]" />
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
        <ul className="flex flex-col gap-2">
          {posts.map(post => (
            <li key={post.id} className="flex justify-between items-center border p-2 rounded">
              <span className="flex-1">
                {post.title} ({post.published ? "Publicado" : "Rascunho"})
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/blog/crud/edit/${post.id}`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </Link>
               <DeletePost postId={post.id} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

