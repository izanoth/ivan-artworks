import { Resend } from 'resend';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {  
  try {
    const { name, email, subject, message } = await req.json();
	 const post = await prisma.contact.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
