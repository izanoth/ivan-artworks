'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Comment = {
  name: string;
  message: string;
  timestamp: string;
};

export default function AdminPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include', // garante envio/recebimento de cookies
      });

      if (res.ok) {
        router.push('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773'); // ou onde quiser redirecionar
      } else {
        console.error('Erro ao fazer logout');
      }
    } catch (err) {
      console.error('Erro de rede no logout', err);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Painel de Comentários (Tempo Real)</h1>
      <ul className="mt-4 space-y-2">
        {comments.map((c, i) => (
          <li key={i} className="border p-2">
            <strong>{c.name}</strong> disse: <em>{c.message}</em><br />
            <small>{new Date(c.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
      <ul>
      
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </ul>
    </main>
  );
}

