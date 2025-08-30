'use client';

import { useRouter } from 'next/navigation';

type Comment = {
  name: string;
  message: string;
  timestamp: string;
};

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch('/c5233bb9-ba20-4b8e-a8e7-8ed79c849773/admin/api/logout', {
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
     <button
       type="button"
       onClick={handleLogout}
       className="bg-red-500 text-white px-4 py-2 rounded"
     >
       Logout
     </button>
  );
}

