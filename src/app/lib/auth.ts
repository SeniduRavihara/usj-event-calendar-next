// src/lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface UserPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
  student_id?: string | null;
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

export function generateToken(user: {
  id: number;
  email: string;
  role: string;
  name: string;
}) {
  const payload: UserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get token from cookies first
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  // Try to get token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export function getCurrentUser(req: NextRequest): UserPayload | null {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}
