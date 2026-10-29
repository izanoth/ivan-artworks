export const dynamic = 'force-dynamic';

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
			include: {				
				collection: true
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
