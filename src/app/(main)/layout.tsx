import { Metadata } from "next";
import ClientLayout from '@/app/_components/ClientLayout';
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Zanoth Independent Digital Artworks",
  description:
    "Fingerprints Album: New Release available now! Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente.",
  openGraph: {
    type: "website",
    url: "https://zanoth.vercel.app/",
    title: "Zanoth © Independent Digital Artworks",
    description:
      "Fingerprints Album: New Release available now! Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente.",
    siteName: "Zanoth Independent Digital Artworks",
    locale: "pt_BR",
    images: [
      {
        url: "https://zanoth.vercel.app/images/fingerprints.png",
        width: 1024,
        height: 1024,
        alt: "Zanoth © Fingerprints Album New Release",
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
      "Fingerprints Album: New Release available now! Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente.",
    images: ["https://zanoth.vercel.app/images/fingerprints.png"],
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
