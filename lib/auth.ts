// lib/auth.ts

//const secret = process.env.JWT_SECRET!;
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  "13pDCQeP3jY$4)e*@LusrNmzQ4HRIpa7YR$%X6UdITg&"
);

// Expiração: 2 horas
const EXPIRATION_TIME = 2 * 60 * 60; // em segundos

export async function signToken(payload: object) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRATION_TIME}s`)
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

