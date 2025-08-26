// app/blog/crud/edit/[id]/page.tsx
import prisma from "@/prisma";
import EditPostForm from "@/blog/components/EditPostForm";

export default async function EditPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return <p>Post não encontrado.</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Post</h1>
      <EditPostForm post={post} />
    </main>
  );
}
