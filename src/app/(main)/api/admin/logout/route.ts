// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin-auth', '', {
    path: '/',
    expires: new Date(0),
  });
  return res;
}

