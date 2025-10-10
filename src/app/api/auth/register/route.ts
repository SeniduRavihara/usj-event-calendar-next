// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hashPassword } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("🚀 Registration API called");

    const { name, email, password, role, department, student_id } =
      await req.json();

    console.log("📝 Registration data received:", {
      name,
      email,
      password: password ? "***hidden***" : "missing",
      role,
      department,
      student_id,
    });

    // Validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Set default role to STUDENT if not provided
    const userRole = role || "STUDENT";
    console.log("👤 User role set to:", userRole);

    // If role is STUDENT, department and student_id are optional for basic registration
    // They can be added later in profile settings

    console.log("🔍 Checking if email already exists...");
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    console.log(
      "📧 Email check result:",
      existing ? "Email exists" : "Email available"
    );

    if (existing) {
      console.log("❌ Email already exists, returning error");
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if student_id already exists (for students)
    if (student_id) {
      console.log("🔍 Checking if student_id already exists...");
      const existingStudent = await prisma.user.findUnique({
        where: { student_id },
      });
      console.log(
        "🆔 Student ID check result:",
        existingStudent ? "Student ID exists" : "Student ID available"
      );
      if (existingStudent) {
        console.log("❌ Student ID already exists, returning error");
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        );
      }
    }

    console.log("🔐 Hashing password...");
    const hashed = await hashPassword(password);
    console.log("✅ Password hashed successfully");

    console.log("💾 Creating user in database...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: userRole,
        department: userRole === "STUDENT" ? department : null,
        student_id: userRole === "STUDENT" ? student_id : null,
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

    console.log("✅ User created successfully:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (err) {
    console.error("💥 Registration error details:", {
      name: (err as Error).name,
      message: (err as Error).message,
      stack: (err as Error).stack,
      cause: (err as Error).cause,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
