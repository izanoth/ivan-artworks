'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

type Comment = {
  name: string;
  message: string;
  timestamp: string;
};

export default function AdminPage() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('comments');
    channel.bind('new-comment', (data: Comment) => {
      setComments((prev) => [data, ...prev]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

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
    </main>
  );
}
