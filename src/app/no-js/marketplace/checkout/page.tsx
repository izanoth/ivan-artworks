import React from 'react';
import prisma from 'lib/prisma';
import { yoctoToNear } from '@/near-service';



export default async function StaticCheckoutPage({
    searchParams,
}: {
    searchParams: { tokenId?: string; accountId?: string; privateKey?: string };
}) {
    const rawId = searchParams.tokenId;
    const numericId = rawId ? parseInt(rawId, 10) : NaN;
    const accountId = searchParams.accountId || 'Não informado';
    const privateKey = searchParams.privateKey;

    const token = !isNaN(numericId) ? await prisma.nftToken.findUnique({ where: { id: numericId } }) : null;

    const priceNear = token && token.priceYocto ? yoctoToNear(token.priceYocto) : '0';

    return (
        <main className="p-8 font-sans max-w-xl mx-auto bg-white text-gray-900 min-h-screen">
            <header className="mb-8 border-b pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Checkout Seguro (Modo Estático)</span>
                <h1 className="text-3xl font-bold mt-2">Revisão da Transação</h1>
                <p className="text-gray-600 mt-1">Confira os detalhes abaixo antes de assinar e transmitir a transação diretamente ao contrato inteligente NEAR.</p>
            </header>

            {/* Debug Banner to track received searchParams */}
            <div className="mb-6 p-4 bg-gray-100 border text-xs font-mono rounded text-gray-700">
                <p><strong>[DEBUG]</strong> rawId: {rawId ?? 'undefined'}</p>
                <p><strong>[DEBUG]</strong> numericId: {numericId}</p>
                <p><strong>[DEBUG]</strong> accountId: {accountId}</p>
                <p><strong>[DEBUG]</strong> hasPrivateKey: {privateKey ? 'YES' : 'NO'}</p>
            </div>

            {token ? (
                <div className="mb-8 p-6 border rounded bg-gray-50 flex flex-col gap-4 shadow-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Ativo (NFT):</span>
                        <span className="font-bold">{token.title || `Token #${token.tokenId}`}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Contrato Inteligente:</span>
                        <span className="font-mono text-sm">{token.contractId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Preço:</span>
                        <span className="font-bold text-green-700">{priceNear} Ⓝ <span className="text-xs text-gray-500 font-normal">({token.priceYocto} yocto)</span></span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Conta Compradora:</span>
                        <span className="font-mono text-sm">{accountId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Rede:</span>
                        <span>{token.network || process.env.NEXT_PUBLIC_NEAR_NETWORK || 'testnet'}</span>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-4 bg-red-50 text-red-700 border rounded">
                    Token não encontrado ou inválido (rawId recebido: &quot;{rawId ?? 'vazio'}&quot;).
                </div>
            )}

            <form method="GET" action="/no-js/marketplace/success" className="flex flex-col gap-4">
                <input type="hidden" name="tokenId" value={rawId || ''} />
                <input type="hidden" name="accountId" value={accountId} />
                {privateKey && <input type="hidden" name="privateKey" value={privateKey} />}
                
                <button
                    type="submit"
                    className="w-full bg-black text-white py-3 px-4 rounded font-semibold hover:bg-gray-800 transition text-center shadow"
                >
                    Assinar e Enviar Transação On-Chain
                </button>
            </form>

            <div className="mt-6 text-center">
                <a href="/no-js/marketplace" className="text-blue-600 underline text-sm">← Cancelar e Voltar ao Marketplace</a>
            </div>
        </main>
    );
}
