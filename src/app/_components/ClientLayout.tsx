'use client';

import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import Header, { HeaderPageItem } from '@/app/_components/Header';
import Footer, { FooterItemType } from '@/app/_components/Footer';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'], display: 'optional' });

export default function ClientLayout({
  children,
  pages,
  footerItems,
  footerText,
}: {
  children: React.ReactNode;
  pages?: HeaderPageItem[];
  footerItems?: FooterItemType[];
  footerText?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        <noscript>
          <meta httpEquiv="refresh" content="0; url=/no-js/marketplace" />
        </noscript>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header selected={selected} setSelected={setSelected} onOpenPopup={handleOpenPopup} pages={pages} />
        <div className="flex-grow">
          {children}
          <Analytics />
        </div>

        <Footer setSelected={setSelected} items={footerItems} text={footerText} />
      </body>
    </html >
  );
}
