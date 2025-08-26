import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { z } from "zod";

const JournalEntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().default(true),
});

// POST /api/journal - Create a new journal entry
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
    const validatedData = JournalEntrySchema.parse(body);

    const journalEntry = await prisma.journalEntry.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        mood: validatedData.mood,
        tags: validatedData.tags || [],
        isPrivate: validatedData.isPrivate,
        userId: user.id,
      },
    });

    return NextResponse.json(journalEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating journal entry:", error);
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

// GET /api/journal - Get user's journal entries
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const mood = searchParams.get("mood") || "";
    const tag = searchParams.get("tag") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      userId: user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (mood) {
      where.mood = mood;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const [journalEntries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          mood: true,
          tags: true,
          isPrivate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return NextResponse.json({
      journalEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}