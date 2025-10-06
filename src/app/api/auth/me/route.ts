// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        student_id: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("User verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

