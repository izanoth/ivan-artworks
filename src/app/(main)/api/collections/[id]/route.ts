import { NextResponse } from "next/server";
import prisma from "@/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		if (!id) {
			return NextResponse.json({ error: "id is required" }, { status: 400 });
		}

		const body = await req.json();
		const {
			network,
			contractId,
			name,
			description,
			maxCopies,
		} = body;

		const collection = await prisma.nftCollection.update({
			where: { id },
			data: {
				network,
				contractId,
				name,
				description,
				maxCopies: maxCopies ? Number(maxCopies) : undefined,
			},
		});

		return NextResponse.json({ ok: true, collection });
	} catch (error: any) {
		console.error("Failed to update collection record:", error);
		return NextResponse.json({
			ok: false,
			error: "Failed to update collection record",
			detail: error.message,
		}, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		if (!id) {
			return NextResponse.json({ error: "id is required" }, { status: 400 });
		}

		await prisma.nftCollection.delete({
			where: { id },
		});

		return NextResponse.json({ ok: true, message: "Collection deleted successfully" });
	} catch (error: any) {
		console.error("Failed to delete collection record:", error);
		return NextResponse.json({
			ok: false,
			error: "Failed to delete collection record",
			detail: error.message,
		}, { status: 500 });
	}
}
