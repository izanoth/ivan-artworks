import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react"
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], display: 'optional' });

export const metadata: Metadata = {
  title: "Zanoth's Artworks",
  description: "Portfolium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <nav className="bg-dark text-white">
          <div className="container mx-auto flex items-center justify-between p-4">
            <div><p className="text-white text-left text-xl font-bold">Zanoth </p><p style={{fontSize: '12px'}} className="text-white text-left font-bold">Independent Artworks</p></div>
            <Link href="/guestbook">
            <i className="bi bi-book" style={{fontSize: '36px', color: 'white'}}></i>
            </Link>
          </div>
        </nav>

        <div className="flex-grow">
          {children}
          <Analytics />
        </div>

        <footer className="py-4">
          <div className="container mx-auto flex flex-wrap justify-between items-center">
            <div className="text-left ml-0">
              <ul className="list-none mb-2 ml-0 p-0">
                <li className="inline mr-2">
                  <Link href="/whoami" className="text-gray-700 hover:text-gray-900">Who Am I</Link>
                </li>
                <li className="inline mx-2 text-gray-500">⋅</li> 
                <li className="inline">
                  <Link href="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link>
                </li>
              </ul>
              <p className="text-gray-600 text-sm mb-0">Zanoth &copy; Independent Artworks 2023. All Rights Reserved.</p>
            </div>
            <div className="text-center text-lg-end my-auto">
              <ul className="list-none mb-0 flex justify-center lg:justify-end">
                <li className="mr-4">
                  <a href="https://instagram.com/_zanoth_" className="text-gray-700 hover:text-gray-900">
                    <i className="bi bi-instagram text-3xl pr-4"></i>
                  </a>
                  <a href="https://github.com/izanoth" className="text-gray-700 hover:text-gray-900">
                    <i className="bi bi-github text-3xl"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
