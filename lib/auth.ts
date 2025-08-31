// lib/auth.ts
import jwt from 'jsonwebtoken';

export async function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '2h' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (e) {
    return null;
  }
}