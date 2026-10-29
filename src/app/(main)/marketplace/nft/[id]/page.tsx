import React from "react";
import prisma from "@/prisma";
import NftDetail from "@/near-studio/marketplace/nft/NftDetail";
import { Metadata } from "next";

type PageProps = {
	params: {
		id: string;
	};
};

async function getNftToken(idStr: string) {
	const id = Number(idStr);
	if (!Number.isInteger(id)) return null;

	const token = await prisma.nftToken.findUnique({
		where: { id },
		include: {
			collection: true,
		},
	});

	if (!token) return null;

	return {
		...token,
		createdAt: token.createdAt.toISOString(),
		updatedAt: token.updatedAt.toISOString(),
		collection: token.collection ? {
			...token.collection,
			createdAt: token.collection.createdAt.toISOString(),
			updatedAt: token.collection.updatedAt.toISOString(),
		} : null,
	};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const token = await getNftToken(params.id);
	const title = token?.title || `NFT #${token?.tokenId || params.id}`;
	const description = token?.description || "Ativo digital verificado no NEAR Studio Marketplace.";
	const image = token?.media || (token?.illustrations?.[0]) || "https://zanoth.vercel.app/images/logo-metadata.png";

	return {
		title: `${title} | NEAR Studio Marketplace`,
		description,
		openGraph: {
			title: `${title} | NEAR Studio Marketplace`,
			description,
			images: [{ url: image, width: 1200, height: 630, alt: title }],
		},
	};
}

export default async function NftDetailPage({ params }: PageProps) {
	const token = await getNftToken(params.id);
	return <NftDetail initialToken={token} />;
}
