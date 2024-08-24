// app/api/simple-endpoint/route.ts

/* export async function GET() {
  return new NextResponse('ok', { status: 200 });
} */


import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
    try {
        const guests = await prisma.guest.findMany();
        return NextResponse.json(guests);
    } catch (error) {
        console.error('Error fetching guests:', error);
        return NextResponse.error();
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { name, email, comment } = await request.json();
        const newGuest = await prisma.guest.create({
            data: {
                name,
                email,
                comment,
            },
        });
        return NextResponse.json(newGuest);
    } catch (error) {
        return NextResponse.error();
    }
}
