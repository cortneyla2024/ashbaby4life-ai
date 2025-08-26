import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { z } from "zod";

const HabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  goal: z.string().optional(),
});

// POST /api/habits - Create a new habit
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
    const validatedData = HabitSchema.parse(body);

    const habit = await prisma.habit.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        frequency: validatedData.frequency,
        goal: validatedData.goal,
        userId: user.id,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/habits - Get user's habits
export async function GET(request: NextRequest) {
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

    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            },
          },
          orderBy: { date: "desc" },
        },
        _count: {
          select: {
            logs: {
              where: {
                completed: true,
                date: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate completion rates and current streaks
    const habitsWithStats = habits.map(habit => {
      const completedLogs = habit.logs.filter(log => log.completed);
      const totalDays = 30; // Last 30 days
      const completionRate = (completedLogs.length / totalDays) * 100;

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const logForDate = habit.logs.find(log => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === checkDate.getTime();
        });

        if (logForDate && logForDate.completed) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        ...habit,
        completionRate: Math.round(completionRate),
        currentStreak,
        completedToday: habit.logs.some(log => {
          const logDate = new Date(log.date);
          const today = new Date();
          return (
            logDate.toDateString() === today.toDateString() && log.completed
          );
        }),
      };
    });

    return NextResponse.json({ habits: habitsWithStats });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}