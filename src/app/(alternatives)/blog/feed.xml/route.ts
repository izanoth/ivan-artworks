// /blog/feed.xml/route.ts
import { Feed } from "feed";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const feed = new Feed({
    title: "Zanoth's Blog",
    description: "Feed oficial",
    id: "https://zanoth.vercel.app/blog",
    link: "https://zanoth.vercel.app/blog",
    language: "pt-BR",
    favicon: "https://zanoth.vercel.app/favicon.ico",
    copyright: `© ${new Date().getFullYear()} Zanoth's Blog`,
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // busca apenas posts do mês atual
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      createdAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `https://zanoth.vercel.app/blog/p/${post.id}`,
      link: `https://zanoth.vercel.app/blog/p/${post.id}`,
      description: post.content,
      date: post.createdAt,
      image: post.image ? `https://zanoth.vercel.app${post.image}` : undefined,
    });
  });

  // gera o RSS
  let rss = feed.rss2();

  // injeta o hub WebSub
  rss = rss.replace(
    "<channel>",
    `<channel>
      <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" xmlns:atom="http://www.w3.org/2005/Atom"/>
      <atom:link href="https://zanoth.vercel.app/blog/feed.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>`
  );

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
