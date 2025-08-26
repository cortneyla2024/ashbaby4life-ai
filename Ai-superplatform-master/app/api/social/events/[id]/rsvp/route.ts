import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();
    const { status } = body; // "ATTENDING" or "INTERESTED"

    if (!status || !["ATTENDING", "INTERESTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either \"ATTENDING\" or \"INTERESTED\"" },
        { status: 400 }
      );
    }

    // Check if event exists and is public
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isPublic) {
      return NextResponse.json(
        { error: "Cannot RSVP to private event" },
        { status: 403 }
      );
    }

    // Check if user has already RSVP'd
    const existingRSVP = await prisma.eventRSVP.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (existingRSVP) {
      // Update existing RSVP
      const updatedRSVP = await prisma.eventRSVP.update({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId,
          },
        },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              date: true,
            },
          },
        },
      });

      return NextResponse.json(updatedRSVP);
    }

    // Create new RSVP
    const rsvp = await prisma.eventRSVP.create({
      data: {
        userId: user.id,
        eventId,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    console.error("Error RSVPing to event:", error);
    return NextResponse.json(
      { error: "Failed to RSVP to event" },
      { status: 500 }
    );
  }
}
