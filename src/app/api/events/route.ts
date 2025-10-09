// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

// GET /api/events - Get all events
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        event_date: "asc",
      },
    });

    // Format events for frontend
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date?.toISOString().split("T")[0] || "",
      time: event.event_time
        ? new Date(
            `2000-01-01T${event.event_time.toISOString().split("T")[1]}`
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "",
      location: event.location,
      departments: event.departments,
      registration_needed: event.registration_needed,
      registration_link: event.registration_link,
      cover_image: event.cover_image,
      cover_color: event.cover_color,
      created_by: event.created_by,
      creator: event.creator,
      created_at: event.created_at,
      updated_at: event.updated_at,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (err) {
    console.error("Error fetching events:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/events - Create new event (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      date,
      time,
      location,
      departments,
      registration_needed,
      registration_link,
      cover_color,
    } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date and time
    const eventDate = new Date(date);
    const eventTime = time ? new Date(`2000-01-01T${time}`) : null;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        location,
        departments: departments ? JSON.parse(departments) : null,
        registration_needed: registration_needed || false,
        registration_link,
        cover_color,
        created_by: user.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

