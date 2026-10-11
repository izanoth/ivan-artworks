import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const network = String(url.searchParams.get("network") || "").trim();
		if (!network) {
			return NextResponse.json({ error: "Informe a rede." }, { status: 400 });
		}

		const collections = await prisma.nftCollection.findMany({
			where: { network },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				network: true,
				contractId: true,
				name: true,
				description: true,
				maxCopies: true,
				createdAt: true,
				updatedAt: true,
				tokens: {
					select: {
						id: true,
						tokenId: true,
						title: true,
					},
				},
			},
		});

		return NextResponse.json(collections, {
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	} catch (error: any) {
		console.error("collection.list:", error);
		return NextResponse.json({ error: "Não foi possível carregar as coleções." }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {
			network,
			contractId,
			name,
			description,
			maxCopies,
		} = body;

		if (!contractId) {
			return NextResponse.json({ error: "contractId is required" }, { status: 400 });
		}

		const collection = await prisma.nftCollection.create({
			data: {
				network,
				contractId,
				name,
				description,
				maxCopies: maxCopies ? Number(maxCopies) : 1,
			},
		});

		return NextResponse.json({ ok: true, collection }, { status: 201 });
	} catch (error: any) {
		console.error("Failed to create NFT collection record:", error);
		return NextResponse.json({
			ok: false,
			error: "Failed to create NFT collection record",
			detail: error.message,
		}, { status: 500 });
	}
}
