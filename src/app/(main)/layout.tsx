import { Metadata } from "next";
import ClientLayout from '@/app/_components/ClientLayout';

export const metadata: Metadata = {
  title: "Zanoth Independent Digital Artworks",
  description: "Zanoth Independent Digital Artworks - Personal Portfolio.",
  openGraph: {
    type: "website",
    url: "https://zanoth.vercel.app/",
    title: "Zanoth © Independent Digital Artworks",
    description: "My Personal Portfolium - Music, Art and Entertainment",
    siteName: "Zanoth Independent Digital Artworks",
    images: [
      {
        url: "https://zanoth.vercel.app/images/zanoth.png",
        width: 239,
        height: 40,
        alt: "Zanoth Independent Digital Artworks",
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zanoth Independent Digital Artworks",
    description: "Music, Art and Entertainment - My Personal Portfolium.",
    images: ["https://zanoth.vercel.app/images/zanoth.png"],
    creator: "@zanoth4",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientLayout>{children}</ClientLayout>
    </>
  );
}
