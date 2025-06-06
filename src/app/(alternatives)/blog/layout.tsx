import "@/globals.css";
import { Metadata } from "next";
import Link from 'next/link';
import PostPreview from '@/blog/components/PostPreview';
import React, { useState } from 'react';
import ClientLayout from '@/blog/components/ClientLayout';

interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        email: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
}

export const metadata: Metadata = {
  title: "Zanoth's Blog | Cultura, Música e Sociedade",
  description: "Reflexões sobre o Brasil, a arte e o mundo contemporâneo.",
  openGraph: {
    type: "website",
    url: "https://zanoth.vercel.app/blog",
    title: "Zanoth e-magazine | Cultura em movimento",
    description: "Um espaço para ideias livres, crítica social, música e arte independente.",
    siteName: "Zanoth Independent Digital Artworks",
    images: [
      {
        url: "https://zanoth.vercel.app/images/zntmag.png",
        width: 865,
        height: 338,
        alt: "Zanoth Independent Digital Artworks",
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zanoth e-magazine",
    description: "Crítica, arte e rebeldia em forma de conteúdo digital.",
    images: ["https://zanoth.vercel.app/images/zanoth.png"],
    creator: "@zanoth4",
  },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script src="https://accounts.google.com/gsi/client" async defer></script>
                <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" type="text/css" />
                <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css" />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            </head>
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
