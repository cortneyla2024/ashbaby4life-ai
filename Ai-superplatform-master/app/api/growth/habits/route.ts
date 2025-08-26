import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = "user123"; // This should come from token verification

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, frequency, goal } = await request.json();

    if (!name || !frequency || !goal) {
      return NextResponse.json({ error: "Name, frequency, and goal are required" }, { status: 400 });
    }

    const userId = "user123"; // This should come from token verification

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        frequency,
        goal,
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
