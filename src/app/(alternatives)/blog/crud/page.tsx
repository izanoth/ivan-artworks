// app/blog/crud/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken, verifyToken } from '@/auth';

export default function BlogCrudPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin-auth")?.value;

  if (!token) {
    redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773");
  }

  try {
    verifyToken(token, process.env.JWT_SECRET!);
  } catch {
    redirect("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Blog CRUD</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Nova Postagem</h2>
        <form action="/api/posts" method="post" className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Título"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="content"
            placeholder="Conteúdo"
            className="border p-2 rounded min-h-[120px]"
          />
          <input
            type="text"
            name="image"
            placeholder="URL da imagem (opcional)"
            className="border p-2 rounded"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" />
            Publicar imediatamente
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Salvar Post
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Postagens Existentes</h2>
        {/* Aqui futuramente listaremos os posts do banco */}
      </section>
    </main>
  );
}

