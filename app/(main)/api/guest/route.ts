// File: src/app/api/guest/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';

export async function GET() {
    try {
        const guests = await prisma.guest.findMany();
        return NextResponse.json(guests);
    } catch (error) {
        console.error('Error fetching guests:', error);
        return NextResponse.error();
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, comment } = await request.json();
        const newGuest = await prisma.guest.create({
            data: {
                name,
                email,
                comment,
            },
        });
        console.log(newGuest);
        return NextResponse.json(newGuest);
    } catch (error) {
        console.log('Error creating guest:', error);
        return NextResponse.error();
    }
}
