import React from 'react';
import prisma from 'lib/prisma';
import nearController from '@/near-studio/controllers/nearController';

export default async function StaticSuccessPage({
    searchParams,
}: {
    searchParams: { tokenId?: string; accountId?: string; privateKey?: string };
}) {
    const rawId = searchParams.tokenId;
    const numericId = rawId ? parseInt(rawId, 10) : NaN;
    const accountId = searchParams.accountId;
    const privateKey = searchParams.privateKey;

    let txHash: string | null = null;
    let errorMsg: string | null = null;

    const token = !isNaN(numericId) ? await prisma.nftToken.findUnique({ where: { id: numericId } }) : null;

    if (token && accountId && privateKey) {
        try {
            // Open session
            await nearController.openSession({
                network: token.network || process.env.NEXT_PUBLIC_NEAR_NETWORK || 'testnet',
                accountId,
                privateKey,
            });

            const NFT_CONTRACT_ID = process.env.CONTRACT_ID || token.contractId || "nft.testnet";
            const BUY_GAS = "300000000000000";

            // Convert yocto to NEAR string correctly using nearController.yoctoToNear
            const depositNear = nearController.yoctoToNear(token.priceYocto || "0");

            console.log("[DEBUG StaticSuccessPage] token.priceYocto:", token.priceYocto, "depositNear:", depositNear);

            // Execute purchase on-chain
            const purchaseResult = await nearController.purchase({
                contractId: NFT_CONTRACT_ID,
                tokenId: token.tokenId,
                marketplaceId: token.id,
                depositNear,
                gas: BUY_GAS,
                accountId,
            });

            txHash = purchaseResult.transactionHash || purchaseResult.result?.transaction?.hash || null;

            // Update database status
            await prisma.nftToken.update({
                where: { id: token.id },
                data: {
                    buyTxHash: txHash,
                    status: "sold",
                    visible: false,
                    ownerId: accountId,
                },
            });

            nearController.closeSession();
        } catch (err: any) {
            console.error("[Static Checkout Purchase Error]:", err);
            errorMsg = err.message || "Erro desconhecido ao executar transação on-chain.";
            nearController.closeSession();
        }
    } else {
        errorMsg = "Dados insuficientes (tokenId, accountId ou privateKey ausentes).";
    }

    return (
        <main className="p-8 font-sans max-w-xl mx-auto bg-white text-gray-900 min-h-screen text-center flex flex-col justify-center items-center">
            {errorMsg ? (
                <>
                    <h1 className="text-3xl font-bold mb-4 text-red-600">Falha na Transação</h1>
                    <p className="text-gray-700 mb-6">{errorMsg}</p>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-4 text-green-600">Transação Realizada com Sucesso!</h1>
                    <p className="text-gray-700 mb-2">A sua compra foi assinada e enviada on-chain para a rede NEAR.</p>
                    {txHash && (
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded mb-6 break-all">
                            Hash da Transação: {txHash}
                        </p>
                    )}
                </>
            )}

            <a
                href="/no-js/marketplace"
                className="bg-black text-white py-2 px-6 rounded font-semibold hover:bg-gray-800 transition"
            >
                Voltar ao Marketplace
            </a>
        </main>
    );
}
