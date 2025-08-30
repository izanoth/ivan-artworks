'use client';

//import '@/globals.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Login bem-sucedido:', data);
        router.push('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin');
      } else if (res.status === 401) {
        setMessage('Credenciais inválidas.');
      } else {
        setMessage('Erro inesperado no login.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro de conexão com o servidor.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <h1 className="text-xl font-bold mb-4">Login Admin</h1>

      <input
        className="border px-3 py-2 block mb-2"
        placeholder="Email"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border px-3 py-2 block mb-2"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 cursor-pointer"
        value="Entrar"
      />

      {message && <div className="text-red-600 mt-2">{message}</div>}
    </form>
  );
}

