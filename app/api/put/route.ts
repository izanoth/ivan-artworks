
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Manipulador para PUT
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
        console.error('Error creating guest:', error);
        return NextResponse.error();
    }
}