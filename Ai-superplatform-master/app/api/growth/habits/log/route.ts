import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { emitAutomationEvent } from "@/lib/automation/event-bus";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date, completed } = await request.json();

    if (!habitId || !date) {
      return NextResponse.json({ error: "Habit ID and date are required" }, { status: 400 });
    }

    // Verify the habit exists and belongs to the user
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Parse the date
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0); // Set to start of day

    // Create or update the habit log
    const habitLog = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: logDate,
        },
      },
      update: {
        completed: completed ?? true,
      },
      create: {
        habitId,
        date: logDate,
        completed: completed ?? true,
      },
    });

    // Emit automation events based on completion status
    if (habitLog.completed) {
      emitAutomationEvent("habit.completed", habit.userId, {
        habitId,
        habitName: habit.name,
        date: logDate,
        logId: habitLog.id,
      });
    } else {
      emitAutomationEvent("habit.missed", habit.userId, {
        habitId,
        habitName: habit.name,
        date: logDate,
        logId: habitLog.id,
      });
    }

    return NextResponse.json({ habitLog }, { status: 200 });
  } catch (error) {
    console.error("Error logging habit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
