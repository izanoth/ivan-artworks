import { Metadata } from "next";
import ClientLayout from '@/app/_components/ClientLayout';
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Zanoth Independent Digital Artworks",
  description:
    "Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente. Explore projetos únicos e publicações originais.",
  openGraph: {
    type: "website",
    url: "https://zanoth.vercel.app/",
    title: "Zanoth © Independent Digital Artworks",
    description:
      "Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente. Publicações, álbuns e ideias em um só espaço.",
    siteName: "Zanoth Independent Digital Artworks",
    locale: "pt_BR",
    images: [
      {
        url: "https://zanoth.vercel.app/images/windscover.png",
        width: 418,
        height: 418,
        alt: "Zanoth © Independent Digital Artworks",
      },
    ],
  },
  other: {
    'fb:app_id': '1621706575132127',
  },
  twitter: {
    card: "summary_large_image",
    title: "Zanoth © Independent Digital Artworks",
    description:
      "Arte digital, publicações e música independente por Zanoth. Um portfólio autoral com atitude e originalidade.",
    images: ["https://zanoth.vercel.app/images/windscover.png"],
    creator: "@zanoth4",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <ClientLayout>
        <Analytics />
        {children}
      </ClientLayout>
    </>
  );
}
