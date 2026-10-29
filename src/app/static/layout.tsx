import React from 'react';
import Image from 'next/image';
import '../globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function NoJsLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <body>
                <header className="container p-4 border-b flex justify-between items-center">
                    <a href="/" className="font-bold text-lg">
                        <Image 
                            height={40}
                            width={300} 
                            src={`${SITE_URL}images/zweb3.png`} 
                            alt="Logo" 
                        />
                    </a>
                    <nav className="flex gap-4">
                        <a href="/static/marketplace" className="hover:underline">Marketplace</a>
                        <a href="/static/blog" className="hover:underline">Blog</a>
                    </nav>
                </header>
                {children}
            </body>
        </html>
    );
}
