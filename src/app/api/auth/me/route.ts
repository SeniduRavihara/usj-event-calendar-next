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

export async function PUT(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, department, student_id } = body;

    // Get current user data from database to compare with existing values
    const currentUser = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        email: true,
        student_id: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Check if student_id is being changed and if it already exists
    // Only check if student_id is provided and different from current value
    if (student_id && student_id !== currentUser.student_id) {
      const existingStudent = await prisma.user.findUnique({
        where: { student_id },
      });
      if (existingStudent) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: {
      name?: string;
      email?: string;
      department?: string;
      student_id?: string | null;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (department !== undefined) updateData.department = department;
    if (student_id !== undefined) updateData.student_id = student_id || null;

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.userId },
      data: updateData,
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

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
