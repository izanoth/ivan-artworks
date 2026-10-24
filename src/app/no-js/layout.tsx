import React from 'react';
import '../globals.css';

export default function NoJsLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <body>
                <header className="p-4 border-b flex justify-between items-center">
                    <a href="/" className="font-bold text-lg">Zanoth Artworks (Modo Estático / Sem JS)</a>
                    <nav className="flex gap-4">
                        <a href="/no-js/marketplace" className="hover:underline">Marketplace</a>
                        <a href="/no-js/blog" className="hover:underline">Blog</a>
                    </nav>
                </header>
                {children}
            </body>
        </html>
    );
}
