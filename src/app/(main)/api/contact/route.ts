import { Resend } from 'resend';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

	 const post = await prisma.contact.create({
      data: { name, email, subject, message },
    });

	 const resend = new Resend(process.env.RESEND_API_KEY);
	 resend.emails.send({
	   from: 'onboarding@resend.dev',
	   to: 'ivanzanoth@gmail.com',
	   subject: subject,
	   html: message
	 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
