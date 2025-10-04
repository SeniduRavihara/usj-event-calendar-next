// src/app/api/auth/register/route.ts
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, department, student_id } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If role is STUDENT, require department and student_id
    if (role === "STUDENT" && (!department || !student_id)) {
      return NextResponse.json(
        { error: "Students must provide department and student_id" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Check if student_id already exists (for students)
    if (student_id) {
      const existingStudent = await prisma.user.findUnique({ 
        where: { student_id } 
      });
      if (existingStudent) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        );
      }
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || "STUDENT", // Default to STUDENT
        department: role === "STUDENT" ? department : null,
        student_id: role === "STUDENT" ? student_id : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        student_id: true,
        created_at: true,
      }, // Don't return password
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 } // 500, not 505
    );
  }
}