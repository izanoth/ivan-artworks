// app/su/editor/page.tsx
import prisma from "@/prisma";
import EditorForm from "./_components/EditorForm";
import { cookies } from "next/headers";
import LogoutButton from '@/admin/components/LogoutButton';


export default async function EditorPage() {
  // Carrega posts e categorias no server

  const cookieStore = cookies(); 
  const adminAuth = cookieStore.get("admin-auth")?.value; 
  const friendAuth = cookieStore.get("friend-auth")?.value; // Definindo email a partir do cookie disponível 
  const email = adminAuth || friendAuth; 
  if (!email) { 
  	 return new Response(JSON.stringify({ 
  	 	error: "Não autenticado" 
  	 }), { status: 401 }); 
  }
  const isAdmin = Boolean(adminAuth);
  
  const user = await prisma.user.findUnique({ where: { email } });
   
  const posts = isAdmin 
	  ? await prisma.post.findMany({
			orderBy: { createdAt: "desc" },	  		
	  		include: {
	  			category:true
	  		}	  		
	  	}) 
	  : (user ? await prisma.post.findMany({ where: { authorId: user.id }, include: { category: true } }) : []);
	
	  
  const categories = await prisma.category.findMany();
  const authors = await prisma.user.findMany();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
		<LogoutButton />      
      <h1 className="text-4xl font-bold mb-6 text-neon-pink drop-shadow-neon">
        Painel do Editor
      </h1>

      {/* Componente client-side isolado */}
      <EditorForm isAdmin={ isAdmin } initialPosts={posts} authors={authors} categories={categories} authorId={user?.id || ""} authorName={user?.name || ""} />
    </div>
  );
}
