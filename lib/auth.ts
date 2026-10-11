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

export async function signNearSession(payload: Record<string, unknown>) {
  return jwt.sign(
    { ...payload, type: 'near-session' },
    process.env.JWT_SECRET!,
    { expiresIn: '12h' },
  );
}

export async function verifyNearSession(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (payload && typeof payload === 'object' && payload.type === 'near-session') {
      return payload;
    }
    return null;
  } catch (e) {
    return null;
  }
}