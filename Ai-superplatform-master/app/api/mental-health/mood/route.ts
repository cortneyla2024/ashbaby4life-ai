import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
;
import { prisma } from "@/lib/database";
import { emitAutomationEvent } from "@/lib/automation/event-bus";

// POST /api/mental-health/mood
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moodScore, notes, tags } = await request.json();

    // Validate input
    if (!moodScore || moodScore < 1 || moodScore > 10) {
      return NextResponse.json({ error: "Invalid mood score" }, { status: 400 });
    }

    // Create mood entry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        mood: moodScore,
        notes,
        activities: tags || [],
      },
    });

    // Emit automation events
    emitAutomationEvent("mood.created", session.user.id, {
      moodScore,
      notes,
      tags,
      entryId: moodEntry.id,
    });

    // Emit mood below threshold event if applicable
    if (moodScore <= 5) {
      emitAutomationEvent("mood.below_threshold", session.user.id, {
        moodScore,
        notes,
        tags,
        entryId: moodEntry.id,
      });
    }

    // Generate AI insight if notes are provided
    if (notes) {
      try {
        const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Analyze this mood entry and provide a brief, supportive insight (max 200 characters): "${notes}". Mood score: ${moodScore}/10. Tags: ${tags?.join(", ") || "none"}. Focus on patterns, encouragement, or gentle suggestions.`,
            context: "mental-health-insight",
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiInsight = aiData.response?.slice(0, 200);

          // Update the mood entry with AI insight
          await prisma.moodEntry.update({
            where: { id: moodEntry.id },
            data: { aiInsight },
          });

          return NextResponse.json({
            ...moodEntry,
            aiInsight,
          });
        }
      } catch (aiError) {
        console.error("AI insight generation failed:", aiError);
        // Continue without AI insight
      }
    }

    return NextResponse.json(moodEntry);
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/mental-health/mood
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [moodEntries, total] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.moodEntry.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      moodEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
