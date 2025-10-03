// src/app/api/auth/login/route.ts
import { prisma } from "../../../lib/prisma";
import { verifyPassword, generateToken } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user.id);

    // Save token in HTTP-only cookie
    const response = NextResponse.json({ message: "Login success" });
    response.cookies.set("token", token, { httpOnly: true, maxAge: 60 * 60 * 24 });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
