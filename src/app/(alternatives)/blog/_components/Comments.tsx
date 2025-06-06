'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id: string;
  postId: string;
  guestName: string;
  text: string;
  createdAt: string;
};


export default function Comments({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    fetch(`/api/blog/comments/${postId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const res = await fetch('/api/blog/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        guestName,
        text,
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setText('');
      setGuestName('');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Comentários</h2>
        <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Seu nome"
            className="w-full p-2 border border-gray-300 rounded"
        />

        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
            placeholder="Faça o seu comentário..."
        />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enviar
      </button>

      <ul className="space-y-2">
        {comments.map((comment: any) => (
          <li key={comment.id} className="p-3 border rounded shadow">
            <p className="font-bold">{comment.guestName}</p>
            <p>{comment.text}</p>
            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
