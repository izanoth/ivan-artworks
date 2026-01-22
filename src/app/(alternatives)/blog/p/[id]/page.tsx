import React from "react";
import PostDetail, { PostProps } from "@/blog/components/PostDetail";
import prisma from "@/prisma";

// Definição do tipo PageProps
type PageProps = {
    params: {
        id: string;
    };
};

// Atualizando o tipo para corresponder à estrutura esperada
type PostWithRelations = {
    id: string;
    title: string;
    content: string | null;
    image: string | null;
    source: string;
    published: boolean;
    author: {
        name: string;
        email: string | null; // Permite que email seja null
    } | null;
    authorId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

// Função assíncrona para buscar dados do post
async function getPostData(id: string): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            author: { select: { name: true, email: true } },
        },
    });

    if (!post) return null;

    // Ajuste a estrutura do objeto para corresponder a PostProps
    return {
        id: post.id,
        title: post.title,
        content: post.content || '',
        image: post.image || '',
        source: post.source || '',
        published: post.published,
        author: post.author ? {
            name: post.author.name || 'Unknown',
            email: post.author.email || null,
        } : null,
        authorId: post.authorId || null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };
}

/*********
//METADATA
**********/
// Função do servidor para buscar os dados do post com base na rota
export async function generateMetadata({ params }: PageProps) {
  function getExcerpt(content: string = "", wordLimit = 30): string {
    return content
      .split(/\s+/)
      .slice(0, wordLimit)
      .join(" ")
      .trim()
      .concat("...");
  }

  const post = await getPostData(params.id);
  const excerpt = getExcerpt(post?.content || "");

  return {
    title: `${post?.title || "Página não encontrada!" } | Zanoth's Blog`,
    description: excerpt,
    openGraph: {
      title: `${post?.title || "Página não encontrada!" } | Zanoth's Blog`,
      description: excerpt,
      url: `https://zanoth.vercel.app/blog/p/${params.id}`,
      siteName: "Zanoth Independent Digital Artworks",
      locale: "pt_BR",
      type: "article",
      images: [
        {
          url: `${post?.image || "https://zanoth.vercel.app/images/logo-metadata.png" }`,
          width: 1200,
          height: 630,
          alt: post?.title || "",
        },
      ],
    },
    other: {
      'fb:app_id': '1621706575132127',
    },
    twitter: {
      card: "summary_large_image",
      title: `${post?.title || "Página não encontrada!" } | Zanoth's Blog`,
      description: excerpt,
      images: ["https://zanoth.vercel.app/images/zntmag.png"],
      creator: "@zanoth4",
    },
  };
}
// Componente principal da página
const PostPage = async ({ params }: PageProps) => {
    const post = await getPostData(params.id);

    if (!post) {
        return <div>Post not found</div>
    }

    // Passa o post tipado corretamente como PostProps
    return (
        <div className="container">
            <PostDetail post={post as PostProps} />
        </div>
    )
};

export default PostPage;
