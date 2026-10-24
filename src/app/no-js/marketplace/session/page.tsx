import React from 'react';
import prisma from 'lib/prisma';
import { yoctoToNear } from '@/near-service';

export default async function StaticSessionPage({ searchParams }: { searchParams: { tokenId?: string } }) {
    const rawId = searchParams.tokenId;
    const numericId = rawId ? parseInt(rawId, 10) : NaN;
    const token = !isNaN(numericId) ? await prisma.nftToken.findUnique({ where: { id: numericId } }) : null;
    const price = yoctoToNear(token?.priceYocto);

    return (
        <main className="p-8 font-sans max-w-xl mx-auto bg-white text-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Abertura de Sessão NEAR</h1>
            <p className="text-gray-600 mb-6">Insira seus dados para autenticar a sessão localmente e prosseguir com a compra.</p>

            {token ? (
                <div className="mb-6 p-4 border rounded bg-gray-50">
                    <h2 className="font-semibold text-lg">{token.title || `NFT #${token.tokenId}`}</h2>
                    <p className="text-sm text-gray-600">Preço: {price} NEAR</p>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 border rounded text-sm">
                    Nenhum NFT selecionado ou ID inválido ({rawId || 'vazio'}).
                </div>
            )}

            <form method="GET" action="/no-js/marketplace/checkout" className="flex flex-col gap-4">
                <input type="hidden" name="tokenId" value={rawId || ''} />
                <div>
                    <label className="block text-sm font-medium mb-1">Account ID NEAR:</label>
                    <input
                        type="text"
                        name="accountId"
                        required
                        placeholder="ex: myaccount.testnet"
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Private Key / Secret Key:</label>
                    <input
                        type="password"
                        name="privateKey"
                        required
                        placeholder="ed25519:..."
                        className="w-full border p-2 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-black text-white py-2 px-4 rounded font-semibold hover:bg-gray-800 transition"
                >
                    Abrir Sessão e Avançar para Checkout
                </button>
            </form>

            <div className="mt-6">
                <a href="/no-js/marketplace" className="text-blue-600 underline text-sm">← Voltar ao Marketplace</a>
            </div>
        </main>
    );
}
