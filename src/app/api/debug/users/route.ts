// src/app/api/debug/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Debug users error:", err);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
