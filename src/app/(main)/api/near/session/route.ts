import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signNearSession, verifyNearSession } from "@/auth";

const NEAR_SESSION_COOKIE = "near-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accountId = String(body?.accountId || "").trim();
    const network = String(body?.network || "").trim();
    const keyType = String(body?.keyType || "").trim();

    if (!accountId || !network || !keyType) {
      return NextResponse.json(
        { ok: false, error: "accountId, network and keyType are required." },
        { status: 400 },
      );
    }

    const token = await signNearSession({ accountId, network, keyType });
    const response = NextResponse.json({ ok: true }, { status: 200 });

    response.cookies.set(NEAR_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create NEAR session cookie." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(NEAR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  const token = cookies().get(NEAR_SESSION_COOKIE)?.value;
  const payload = token ? await verifyNearSession(token) : null;

  return NextResponse.json({ ok: Boolean(payload) }, { status: 200 });
}
