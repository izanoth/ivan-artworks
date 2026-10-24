import { Metadata } from "next";
import ClientLayout from '@/app/_components/ClientLayout';
import { Analytics } from "@vercel/analytics/react";
import prisma from 'lib/prisma';

export const metadata: Metadata = {
  title: "Zanoth Independent Digital Artworks",
  description:
    "Fingerprints Album: New Release available now! Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente.",
  openGraph: {
    type: "website",
    url: "https://zanoth.vercel.app/",
    title: "Zanoth © Independent Digital Artworks",
    description:
      "Música autoral, arte experimental e cultura independente.",
    siteName: "Zanoth - Independent Digital Artworks",
    locale: "pt_BR",
    images: [
      {
        url: "https://zanoth.vercel.app/images/zweb3.png",
        width: 1024,
        height: 1024,
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
      "Fingerprints Album: New Release available now! Portfólio digital de Zanoth — música autoral, arte experimental e cultura independente.",
    images: ["https://zanoth.vercel.app/images/fingerprints.png"],
    creator: "@zanoth4",
  },
};


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pages = await prisma.page.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const footerItems = await prisma.footerItem.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { order: 'asc' },
  });

  const footerContent = await prisma.content.findFirst({
    where: { page: { name: 'footer' }, deletedAt: null },
    orderBy: { version: 'desc' },
  });

  return (
    <ClientLayout pages={pages} footerItems={footerItems} footerText={footerContent?.body}>
      <Analytics />
      {children}
    </ClientLayout>
  );
}
