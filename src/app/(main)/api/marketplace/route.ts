import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const network = String(url.searchParams.get("network") || "").trim();
		if (!network) {
			return NextResponse.json({ error: "Informe a rede." }, { status: 400 });
		}

		const ownerId = String(url.searchParams.get("ownerId") || "").trim();
		const where: any = { network };

		if (ownerId) {
			where.ownerId = ownerId;
			where.status = "for_sale";
		} else {
			where.visible = true;
			where.status = "for_sale";
		}

		const tokens = await prisma.nftToken.findMany({
			where,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				network: true,
				contractId: true,
				collectionId: true,
				tokenId: true,
				priceYocto: true,
				title: true,
				description: true,
				media: true,
				holders: true,
				illustrationUrl: true,
				visible: true,
				ownerId: true,
				royalties: true,
				status: true,
				copies: true,
				mintTxHash: true,
				buyTxHash: true,
				metadataJson: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(tokens, {
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error: any) {
		console.error("marketplace.list:", error);
		return NextResponse.json({ error: "Não foi possível carregar os NFTs." }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {
			network,
			contractId,
			tokenId,
			priceYocto,
			title,
			description,
			media,
			holders,
			illustrationUrl,
			visible,
			ownerId,
			royalties,
			status,
			copies,
			mintTxHash,
			buyTxHash,
			metadataJson,
			collectionId,
		} = body;

		if (!network) {
			return NextResponse.json({ error: "network is required" }, { status: 400 });
		}
		if (!contractId) {
			return NextResponse.json({ error: "contractId is required" }, { status: 400 });
		}
		if (!tokenId) {
			return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
		}
		if (!ownerId) {
			return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
		}
		if (priceYocto == null) {
			return NextResponse.json({ error: "priceYocto is required" }, { status: 400 });
		}

		const nft = await prisma.nftToken.create({
			data: {
				network,
				contractId,
				tokenId,
				priceYocto: String(priceYocto),
				visible: Boolean(visible ?? true),
				title: title || null,
				description: description || null,
				media: media || null,
				holders: holders || null,
				illustrationUrl: illustrationUrl || null,
				ownerId: ownerId || null,
				royalties: royalties || null,
				status: status || "for_sale",
				copies: copies || null,
				mintTxHash: mintTxHash || null,
				buyTxHash: buyTxHash || null,
				metadataJson: metadataJson ? JSON.stringify(metadataJson) : null,
				collectionId: collectionId || null,
			},
		});

		return NextResponse.json({ ok: true, nft }, { status: 201 });
	} catch (error: any) {
		console.error("Failed to create NFT database record:", error);
		return NextResponse.json({
			ok: false,
			error: "Failed to create NFT database record",
			detail: error.message,
		}, { status: 500 });
	}
}
