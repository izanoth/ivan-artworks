import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		if (!Number.isInteger(id)) {
			return NextResponse.json({ error: "ID do token é inválido." }, { status: 400 });
		}

		const body = await req.json();

		const normalizeHolderList = (value: any): string[] => {
			if (Array.isArray(value)) {
				return value.map((item) => String(item).trim()).filter(Boolean);
			}
			if (typeof value === "string") {
				const trimmed = value.trim();
				if (!trimmed) return [];
				if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
					try {
						const parsed = JSON.parse(trimmed);
						return normalizeHolderList(parsed);
					} catch {
						return [];
					}
				}
				return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
			}
			return [];
		};

		const updateData: any = {};
		if (body.visible !== undefined) {
			updateData.visible = Boolean(body.visible);
		}
		if (body.copies !== undefined) {
			updateData.copies = Number(body.copies);
		}
		if (body.status !== undefined) {
			updateData.status = String(body.status);
		}
		if (body.ownerId !== undefined && body.ownerId != null && String(body.ownerId).trim() !== "") {
			updateData.ownerId = String(body.ownerId);
		}
		if (body.priceYocto !== undefined && body.priceYocto != null) {
			updateData.priceYocto = String(body.priceYocto);
		}
		if (body.mintTxHash !== undefined && body.mintTxHash != null && String(body.mintTxHash).trim() !== "") {
			updateData.mintTxHash = String(body.mintTxHash);
		}
		if (body.buyTxHash !== undefined && body.buyTxHash != null && String(body.buyTxHash).trim() !== "") {
			updateData.buyTxHash = String(body.buyTxHash);
		}
		if (body.holders !== undefined) {
			const holderList = normalizeHolderList(body.holders);
			if (holderList.length > 0) {
				updateData.holders = holderList;
			}
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "Nenhum campo foi enviado." }, { status: 400 });
		}

		const nft = await prisma.nftToken.update({
			where: { id },
			data: updateData,
		});

		return NextResponse.json({ ok: true, nft });
	} catch (error: any) {
		console.error("Failed to update NFT database record:", error);
		return NextResponse.json({
			ok: false,
			error: "Failed to update NFT database record",
			detail: error.message,
		}, { status: 500 });
	}
}
