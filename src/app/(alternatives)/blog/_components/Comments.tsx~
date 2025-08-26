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

  const [loading, setLoading] = useState(false);

  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval); // limpeza
  }, [loading]);
  
  useEffect(() => {
    fetch(`/api/blog/comments/${postId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [postId]);

  const handleSubmit = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

return (
  <div className="flex justify-start">
    <div className="w-72 space-y-4 p-4 border border-gray-200 rounded-md bg-white shadow-sm text-sm">
      <h2 className="text-base font-semibold text-gray-800">Comentários</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-xs text-dark animate-pulse">Enviando {dots}</p>
        </div>
      ) : (
        comments.length > 0 && (
          <div className="max-h-48 overflow-auto border border-gray-100 rounded p-2">
            <ul className="space-y-2">
              {comments.map((comment: any) => (
                <li key={comment.id} className="p-2 border rounded text-gray-700 bg-gray-50">
                  <p className="font-medium text-gray-800">{comment.guestName}</p>
                  <p>{comment.text}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* Formulário de comentários */}
      <div className="space-y-2 pt-2">
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Seu nome"
          className="w-full p-1.5 border border-gray-300 rounded text-sm"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Comente..."
          className="w-full p-1.5 border border-gray-300 rounded text-sm resize-none"
        />

        <button
          onClick={handleSubmit}
          className="w-full px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
  );
}

