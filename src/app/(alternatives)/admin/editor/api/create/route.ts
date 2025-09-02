import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma'
import { verifyToken } from "@/auth";
import { cookies } from "next/headers";

type Auth = {
  role: string;
  username: string;
};

async function getAuthFromRequest(): Promise<Auth> {
  const cookieStore = cookies();

  const adminCookie = cookieStore.get("admin-auth")?.value;
  const friendCookie = cookieStore.get("friend-auth")?.value;

  // garante que verifyToken sempre retorne um objeto ou null
  const adminAuth = adminCookie
    ? (await verifyToken(adminCookie)) as Auth | null
    : null;

  const friendAuth = friendCookie
    ? (await verifyToken(friendCookie)) as Auth | null
    : null;

  // auth final: admin > friend > guest
  const auth: Auth = adminAuth || friendAuth || { role: "guest", username: 'default' };

  return auth;
}

export async function POST(req: NextRequest) {
  try {
	   const auth = await getAuthFromRequest();

	   const data = await req.json();
		
		// Campos básicos
		const title = data.title;
		const content = data.content;
		const categoryId = data.categoryId;
		const publishedRaw = data.published;
		const published = publishedRaw === "on" || publishedRaw === "true";
		const imagePath = data.imagePath;
		const source = data.source;
		const authorIdFromForm = data.finalAuthorId;
			   
		const user = await prisma.user.findUnique({
		  where: { email: auth.username },
		});
		
		const selectAuthor = user?.id;
		
		let authorId: string | null = null;
		
		if (auth.role === "admin") {
		  // admin: pode passar authorId do form, ou usar fallback do token
		  authorId = authorIdFromForm ?? selectAuthor ?? null;
		} else if (auth.role === "editor") {
		  authorId = selectAuthor ?? null;
		}
						console.log('selectAuthor: ', selectAuthor);
				console.log('auth.role: ', auth.role);
		console.log('authorId: ', authorId);
	    if (!authorId) {
	      return NextResponse.json({ error: 'Missing authorId' }, { status: 400 })
	    }
		console.log(authorId);
	    const newPost = await prisma.post.create({
	      data: {
	        title,
	        content,
	        published,
	        categoryId,
	        authorId,
	      },
	    });
	    
	    // notifica hub (RSS)
	    const hubUrl = "https://pubsubhubbub.appspot.com/";
	    const feedUrl = "https://zanoth.vercel.app/blog/feed.xml";
	    fetch(hubUrl, {
	      method: "POST",
	      headers: { "Content-Type": "application/x-www-form-urlencoded" },
	      body: new URLSearchParams({
	        "hub.mode": "publish",
	        "hub.url": feedUrl,
	    }),
    }).catch(console.error);

    return NextResponse.json(newPost, { status: 201 })
  } catch (err) {
    console.error('POST /api/blog/create error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
