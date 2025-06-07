'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin');
    } else {
      alert('Credenciais inválidas.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h1 className="text-xl font-bold mb-4">Login Admin</h1>
      <input
        className="border px-3 py-2 block mb-2"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border px-3 py-2 block mb-2"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2">Entrar</button>
    </form>
  );
}
