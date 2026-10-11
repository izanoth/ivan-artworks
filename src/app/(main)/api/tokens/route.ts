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
		const contractId = String(url.searchParams.get("contractId") || "").trim();
		const where: any = { network };
		if (ownerId) where.ownerId = ownerId;
		if (contractId) where.contractId = contractId;

		const tokens = await prisma.nftToken.findMany({
			where,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				network: true,
				contractId: true,
				tokenId: true,
				priceYocto: true,
				title: true,
				visible: true,
				description: true,
				media: true,
				ownerId: true,
				status: true,
				holders: true,
				illustrationUrl: true,
				mintTxHash: true,
				buyTxHash: true,
				copies: true,
				metadataJson: true,
				createdAt: true,
				updatedAt: true,
				collection: {
					select: {
						id: true,
						name: true,
						description: true,
						maxCopies: true,
					},
				},
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
		console.error("tokens.list:", error);
		return NextResponse.json({ error: "Não foi possível carregar os NFTs." }, { status: 500 });
	}
}
