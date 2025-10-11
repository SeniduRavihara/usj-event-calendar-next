// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

// GET /api/events/[id] - Get single event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Format event for frontend
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date?.toISOString().split("T")[0] || "",
      time: event.event_time
        ? event.event_time.toISOString().split("T")[1].substring(0, 5)
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
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (err) {
    console.error("Error fetching event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
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

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Parse date and time
    const eventDate = date ? new Date(date) : existingEvent.event_date;
    const eventTime = time
      ? new Date(`2000-01-01T${time}`)
      : existingEvent.event_time;

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title || existingEvent.title,
        description: description || existingEvent.description,
        event_date: eventDate,
        event_time: eventTime,
        location: location || existingEvent.location,
        departments: departments
          ? JSON.parse(departments)
          : existingEvent.departments,
        registration_needed:
          registration_needed !== undefined
            ? registration_needed
            : existingEvent.registration_needed,
        registration_link: registration_link || existingEvent.registration_link,
        cover_color: cover_color || existingEvent.cover_color,
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

    // Format event for frontend
    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date?.toISOString().split("T")[0] || "",
      time: event.event_time
        ? event.event_time.toISOString().split("T")[1].substring(0, 5)
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
    };

    return NextResponse.json({
      message: "Event updated successfully",
      event: formattedEvent,
    });
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
