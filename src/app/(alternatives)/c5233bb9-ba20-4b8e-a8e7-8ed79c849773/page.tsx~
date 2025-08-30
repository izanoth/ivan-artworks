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
        credentials: 'include',
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
	    <form
	      onSubmit={handleSubmit}
	      className="flex flex-col space-y-4"
	    >
	      <h1 className="text-2xl font-semibold text-center text-gray-800">
	        Login Admin
	      </h1>
	
	      <input
	        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
	        placeholder="Email"
	        type="text"
	        value={username}
	        onChange={(e) => setUsername(e.target.value)}
	      />
	
	      <input
	        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
	        placeholder="Senha"
	        type="password"
	        value={password}
	        onChange={(e) => setPassword(e.target.value)}
	      />
	
	      <button
	        type="submit"
	        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
	      >
	        Entrar
	      </button>
	
	      {message && (
	        <div className="text-red-600 text-sm text-center">{message}</div>
	      )}
	    </form>
  );
}

