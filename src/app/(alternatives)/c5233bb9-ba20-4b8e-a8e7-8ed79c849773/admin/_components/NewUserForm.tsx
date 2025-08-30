"use client";

import { useState } from "react";

export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/api/newuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });

    if (res.ok) {
      setMessage("Usuário criado com sucesso!");
      setName("");
      setEmail("");
      setRole("user");
    } else {
      const data = await res.json();
      setMessage(data.error || "Erro ao criar usuário.");
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 mt-10">
      <h2 className="text-lg font-semibold mb-4">Criar Usuário</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="user">Usuário</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Criar
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
