// src/app/api/analytics/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (userPayload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    // Get users by department
    const usersByDepartment = await prisma.user.groupBy({
      by: ["department"],
      _count: {
        id: true,
      },
      where: {
        department: {
          not: null,
        },
      },
    });

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get users with student IDs
    const usersWithStudentId = await prisma.user.count({
      where: {
        student_id: {
          not: null,
        },
      },
    });

    // Get all users for detailed view
    const allUsers = await prisma.user.findMany({
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
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      statistics: {
        totalUsers,
        totalStudents,
        totalAdmins,
        recentUsers,
        usersWithStudentId,
        usersByDepartment: usersByDepartment.map((dept) => ({
          department: dept.department,
          count: dept._count.id,
        })),
      },
      users: allUsers,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
