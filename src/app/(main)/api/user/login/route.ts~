// /admin/api/login/route.ts
console.log("[DEBUG] process.env keys:", Object.keys(process.env));

import { cookies } from 'next/headers';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { signToken } from '@/auth';

export async function POST(req: Request) {
  try {
    console.log('[DEBUG] Requisição recebida');

    const { username, password } = await req.json();
    console.log('[DEBUG] Dados recebidos:', { username, password });

    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASS;

    console.log('[DEBUG] Variáveis do ambiente:', {
      adminUser,
      adminPassword,
    });

    if (username === 'izanoth' && password ===   process.env.ADMIN_PASS) {
      const token = await signToken({ username });
      console.log('[DEBUG] Token gerado:', token);

      const res = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Token': token,
        },
      });

      res.cookies.set('admin-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 2, // 2 horas
      });

      return res;
    }

    console.warn('[WARN] Credenciais inválidas');
    return NextResponse.json({ success: false, username }, { status: 401 });

  } catch (err) {
    console.error('[ERROR] Erro no endpoint de login:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

