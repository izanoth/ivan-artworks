// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { signToken } from '@/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASS;

  if (email === adminUser && password === adminPassword) {
    const res = NextResponse.json({ success: true });
    const token = signToken({ email });

    res.cookies.set('admin-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 horas
    });


    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
