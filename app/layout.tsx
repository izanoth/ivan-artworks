/* "use client";
 */
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from 'next-auth/react';
import Header from '@/layout/Header';
import Footer from '@/layout/Footer';

const inter = Inter({ subsets: ['latin'], display: 'optional' });

export default function RootLayout({
  children,
  header: CustomHeader = Header, // Permite definir um Header personalizado
}: {
  children: React.ReactNode;
  header?: React.ElementType; // Permite passar um componente de Header diferente
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Portfolium" />
        <meta name="author" content="Ivan Cilento" />
        <title>Zanoth&apos;s Artworks</title>
        <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css" />
        <Script src="globals.js" strategy="beforeInteractive" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
      {/* <SessionProvider> */}
        <CustomHeader />
       {/*  </SessionProvider> */}

        <div className="flex-grow">
            {children}
          <Analytics />
        </div>

        <Footer />

      </body>
    </html >
  );
}
