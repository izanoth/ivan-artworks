// app/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASS;

  if (email === adminUser && password === adminPassword) {
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin-auth', 'true', { httpOnly: true, path: '/c5233bb9-ba20-4b8e-a8e7-8ed79c849773' });
    return res;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
