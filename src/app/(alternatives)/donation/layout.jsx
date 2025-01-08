
'use client';

import { useEffect, useState } from 'react';
import './styles/globals.css';
import { NearContext } from './context.js';
import { Navigation } from './components/Navigation';
import { Wallet } from './wallets/near.js';
import { NetworkId } from './config.js';
import Footer from '@/app/_components/Footer';
import '@/app/globals.css';
import "@/globals.css";

const wallet = new Wallet({ networkId: NetworkId });

export default function RootLayout({ children }) {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Portfolium" />
        <meta name="author" content="Ivan Cilento" />
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
        <title>Zanoth&apos;s Blog</title>
      </head>

      <body>
        <NearContext.Provider value={{ wallet, signedAccountId }}>
          <Navigation />
          {children}
          <div className="pt-4">
            <Footer />
          </div>
        </NearContext.Provider>
      </body>
    </html>
  )
}
