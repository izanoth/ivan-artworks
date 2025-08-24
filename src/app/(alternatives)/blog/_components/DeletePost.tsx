"use client";

export default function DeletePost({ postId }: { postId: string }) {
  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    const res = await fetch(`/api/blog/${postId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Post excluído com sucesso!");
      window.location.href = "/blog";
    } catch (err: any) {
      alert(`${err.message}`);
    }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
    >
      Excluir
    </button>
  );
}
