// app/su/editor/page.tsx
import prisma from "@/prisma";
import EditorForm from "./_components/EditorForm";
import { cookies } from "next/headers";
import LogoutButton from '@/admin/components/LogoutButton';
import { verifyToken } from "@/auth";

export default async function EditorPage() {
  // Carrega posts e categorias no server

  const cookieStore = cookies(); 
  const adminAuth = await verifyToken(cookieStore.get("admin-auth")?.value); 
  const friendAuth = await verifyToken(cookieStore.get("friend-auth")?.value); // Definindo email a partir do cookie disponível 
  const auth = adminAuth || friendAuth; 
  if (!auth) { 
  	 return new Response(JSON.stringify({ 
  	 	error: "Não autenticado" 
  	 }), { status: 401 }); 
  }
  const isAdmin = Boolean(adminAuth);
	const uniqueUser = await prisma.user.findUnique({
	  where: { email: auth.username },
	});
   
  const posts = isAdmin 
	  ? await prisma.post.findMany({
			orderBy: { createdAt: "desc" },	  		
	  		include: {
	  			category:true
	  		}	  		
	  	}) 
	  : (uniqueUser ? await prisma.post.findMany({ where: { authorId: uniqueUser.id }, include: { category: true } }) : []);
	
	  
  const categories = await prisma.category.findMany();
  const authors = await prisma.user.findMany();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
		<LogoutButton />      
      <h1 className="text-4xl font-bold mb-6 text-neon-pink drop-shadow-neon">
        Painel do Editor
      </h1>

      {/* Componente client-side isolado */}
      <EditorForm isAdmin={ isAdmin } initialPosts={posts} authors={authors} categories={categories} authorId={uniqueUser?.id || ""} authorName={uniqueUser?.name || ""} />
    </div>
  );
}
