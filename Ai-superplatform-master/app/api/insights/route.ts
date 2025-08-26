import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
;

const prisma = new PrismaClient();

// GET: Fetch user's insights
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause
    const where: any = { userId: user.id };

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    // Fetch insights
    const insights = await prisma.proactiveInsight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.proactiveInsight.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      insights,
      unreadCount,
      total: insights.length,
    });

  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Mark insights as read
export async function PATCH(request: NextRequest) {
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
    const { insightIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all user's insights as read
      await prisma.proactiveInsight.updateMany({
        where: { userId: user.id },
        data: { isRead: true },
      });

      return NextResponse.json({
        message: "All insights marked as read",
      });
    }

    if (insightIds && Array.isArray(insightIds)) {
      // Mark specific insights as read
      await prisma.proactiveInsight.updateMany({
        where: {
          id: { in: insightIds },
          userId: user.id,
        },
        data: { isRead: true },
      });

      return NextResponse.json({
        message: `${insightIds.length} insights marked as read`,
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  } catch (error) {
    console.error("Error updating insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
