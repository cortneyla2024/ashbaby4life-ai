import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
;

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const routines = await prisma.automationRoutine.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ routines });
  } catch (error) {
    console.error("Error fetching automation routines:", error);
    return NextResponse.json(
      { error: "Failed to fetch automation routines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, triggers, actions } = body;

    if (!name || !triggers || !actions) {
      return NextResponse.json(
        { error: "Missing required fields: name, triggers, actions" },
        { status: 400 }
      );
    }

    // Validate triggers and actions
    if (!Array.isArray(triggers) || triggers.length === 0) {
      return NextResponse.json(
        { error: "At least one trigger is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: "At least one action is required" },
        { status: 400 }
      );
    }

    // Create the routine with triggers and actions as JSON
    const routine = await prisma.automationRoutine.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        trigger: triggers[0]?.type || "manual",
        actions: actions,
      },
    });

    return NextResponse.json({ routine }, { status: 201 });
  } catch (error) {
    console.error("Error creating automation routine:", error);
    return NextResponse.json(
      { error: "Failed to create automation routine" },
      { status: 500 }
    );
  }
}
