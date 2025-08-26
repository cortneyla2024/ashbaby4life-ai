import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
;
import { prisma } from "@/lib/database";

// POST /api/mental-health/assessment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, scores } = await request.json();

    // Validate input
    if (!type || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create assessment
    const assessment = await prisma.mentalHealthAssessment.create({
      data: {
        userId: session.user.id,
        type,
        scores,
      },
    });

    // Generate AI summary
    try {
      const scoreData = typeof scores === "object" ? JSON.stringify(scores) : scores;
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Analyze this ${type} assessment result and provide a supportive, professional summary (max 500 characters). Focus on patterns, severity level, and gentle suggestions. Be encouraging and emphasize that this is just one data point. Results: ${scoreData}`,
          context: "mental-health-assessment",
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const summary = aiData.response?.slice(0, 500);

        // Update the assessment with AI summary
        await prisma.mentalHealthAssessment.update({
          where: { id: assessment.id },
          data: { summary },
        });

        return NextResponse.json({
          ...assessment,
          summary,
        });
      }
    } catch (aiError) {
      console.error("AI summary generation failed:", aiError);
      // Continue without AI summary
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/mental-health/assessment
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: session.user.id,
      ...(type && { type }),
    };

    const [assessments, total] = await Promise.all([
      prisma.mentalHealthAssessment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mentalHealthAssessment.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      assessments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
