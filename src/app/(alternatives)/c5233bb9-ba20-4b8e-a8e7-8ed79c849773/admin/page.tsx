import { LogoutButton } from './LogoutButton';

export default function AdminPage() {
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
      
	      <li>
	      	<LogoutButton />
			</li>      
      </ul>
    </main>
  );
}

