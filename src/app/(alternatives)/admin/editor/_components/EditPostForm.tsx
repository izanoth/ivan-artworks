"use client";

import { useState } from "react";

export default function EditPostForm({ post }: { post: any }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
	
    const formData = new FormData(e.currentTarget);

  	 const payload = {
	    id: post.id,
	    title: formData.get("title"),
	    content: formData.get("content"),
	    published: formData.get("published") === "on", // checkbox
	 };

	 try {
	    const res = await fetch(`/admin/editor/api/${post.id}`, {
	      method: "PUT",
	      headers: {
	        "Content-Type": "application/json",
	      },
	      body: JSON.stringify(payload),
	      credentials: 'include',
	    });
	    
	    setLoading(false);
	    
	    if (res.ok) {
	      alert("Post atualizado com sucesso!");
	      window.location.href = "/blog/crud";
	    } 
	    else {
		   alert("Erro ao atualizar post");
		 }
    } catch (err: any) {
      alert(`${err.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="title"
        defaultValue={post.title}
        className="border p-2 rounded"
        required
      />
      <textarea
        name="content"
        defaultValue={post.content}
        className="border p-2 rounded min-h-[120px]"
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={post.published} />
        Publicar
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Salvando..." : "Salvar Alterações"}
      </button>
    </form>
  );
}

