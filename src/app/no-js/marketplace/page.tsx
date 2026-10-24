import React from 'react';
import prisma from 'lib/prisma';
import { yoctoToNear } from '@/near-service';

function normalizeTokenImages(token: any): string[] {
    if (!token) return [];
    const images: string[] = [];
    const candidates: any[] = [];

    if (Array.isArray(token.illustrations)) {
        candidates.push(...token.illustrations);
    }
    if (typeof token.illustrationUrl === "string" && token.illustrationUrl.trim()) {
        candidates.push(token.illustrationUrl);
    }
    if (typeof token.media === "string" && token.media.trim()) {
        candidates.push(token.media);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zanoth.vercel.app";

    for (const candidate of candidates) {
        if (typeof candidate !== "string") continue;
        let value = candidate.trim();
        if (!value || images.includes(value)) continue;
        if (value.startsWith('/')) {
            value = `${baseUrl}${value}`;
        }
        images.push(value);
    }

    return images;
}

async function getMarketplaceTokens() {
    try {
        const tokens = await prisma.nftToken.findMany({
            where: { visible: true },
            orderBy: { createdAt: 'desc' },
        });
        return tokens;
    } catch (error) {
        console.error("Failed to fetch marketplace tokens from database:", error);
        return [];
    }
}

export default async function StaticMarketplacePage() {
    const tokens = await getMarketplaceTokens();
    const NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";
    const SOURCE_URL = process.env.SOURCE_URL;

    return (
        <main className="marketplace-body p-8 font-sans bg-white text-gray-900 min-h-screen">
            <section className="marketplace-container max-w-5xl mx-auto">
                <header className="marketplace-intro mb-8 border-b pb-6">
                    <div className="marketplace-heading">
                        <span className="eyebrow text-xs uppercase font-bold tracking-wider text-gray-500">NEAR NFT Marketplace (Modo Estático / Rudimentar)</span>
                        <h1 className="text-3xl font-bold mt-2">Galeria de Ativos</h1>
                        <p className="text-gray-700 mt-1">
                            Explore os ativos publicados na rede <strong>{NETWORK}</strong>. Navegação simplificada sem JavaScript.
                        </p>
                    </div>

                    <aside className="security-note mt-4 p-4 bg-gray-50 border rounded text-sm" role="note">
                        <strong>Informação:</strong> Modo estático sem JS. <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="text-blue-600 underline">Código-fonte aberto →</a>
                    </aside>
                </header>

                {tokens.length === 0 ? (
                    <div className="marketplace-state text-center py-12 text-gray-500">
                        <strong>Nenhum NFT disponível</strong>
                        <p>Não existem ativos disponíveis nesta rede no momento.</p>
                    </div>
                ) : (
                    <section className="nft-grid flex flex-col gap-6" aria-label="NFTs disponíveis">
                        {tokens.map((token) => {
                            const images = normalizeTokenImages(token);
                            const price = yoctoToNear(token.priceYocto);
                            return (
                                <article className="nft-card w-full border border-gray-200 rounded p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between" key={token.id}>
                                    <div className="nft-media w-full md:w-1/2">
                                        {images.length === 0 ? (
                                            <div className="bg-gray-100 h-40 flex items-center justify-center border text-gray-400 rounded">Sem imagem</div>
                                        ) : (
                                            <div className="grid grid-flow-col auto-cols-fr gap-2 overflow-x-auto">
                                                {images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img}
                                                        alt={token.title || `NFT ${token.tokenId}`}
                                                        className="w-full h-32 object-cover border rounded"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="nft-info w-full md:w-1/2 flex flex-col gap-3">
                                        <h3 className="font-bold text-xl">{token.title || `NFT #${token.tokenId}`}</h3>
                                        <p className="text-sm text-gray-600">{token.description || "Sem descrição disponível."}</p>
                                        <p className="font-semibold text-gray-900">Preço: {price} NEAR</p>
                                        <a
                                            href={`/no-js/marketplace/session?tokenId=${token.id}`}
                                            className="inline-block text-center bg-black text-white py-2 px-4 rounded text-sm font-semibold hover:bg-gray-800 transition mt-2"
                                        >
                                            Iniciar Sessão e Comprar
                                        </a>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </section>
        </main>
    );
}
