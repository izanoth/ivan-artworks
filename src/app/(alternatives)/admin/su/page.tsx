// app/dashboard/page.tsx
import prisma from "@/prisma";
import Link from "next/link";
import LogoutButton from '@/admin/components/LogoutButton';
import NewUserForm from "./_components/NewUserForm"; 

import { cookies } from "next/headers";
import { verifyToken } from "@/auth";

export default async function Dashboard() {
  const commentsCount = await prisma.comment.count();
  const cookieStore = cookies(); 
    
  const tokenObject = await verifyToken(cookieStore.get("admin-auth")?.value || "");

  const latestComments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { post: { select: { title: true } } }, // mostra título do post
  });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Widget: Comments */}
        <div className="bg-white shadow rounded-2xl p-6">
          <p className="text-sm text-gray-500">Comments</p>
          <p className="text-3xl font-bold mb-4">{commentsCount}</p>

          <ul className="space-y-2 text-sm text-gray-700">
            {latestComments.map((c) => (
              <li key={c.id} className="border-b pb-1">
                <span className="font-semibold">{c.guestName}</span>:{" "}
                {c.text.length > 30 ? c.text.slice(0, 30) + "..." : c.text}
                <br />
                <span className="text-gray-500 text-xs">
                  em <em>{c.post?.title}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Widget: Blog CRUD */}
        <div className="bg-blue-600 text-white shadow rounded-2xl p-6 flex flex-col items-center justify-center">
          <p className="text-lg mb-2">Gerenciar Blog</p>
          <Link
            href="/admin/editor"
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold"
          >
            Ir para CRUD
          </Link>
        </div>
        <NewUserForm />
        <LogoutButton />
      </div>
    </main>
  );
}
