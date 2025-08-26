import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";

// GET /api/mental-health/strategies
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};
    if (category) {
whereClause.category = category;
}
    if (type) {
whereClause.type = type;
}
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [strategies, total] = await Promise.all([
      prisma.copingStrategy.findMany({
        where: whereClause,
        orderBy: { title: "asc" },
        skip,
        take: limit,
      }),
      prisma.copingStrategy.count({
        where: whereClause,
      }),
    ]);

    // Get user's saved strategies to mark them
    const savedStrategies = await prisma.savedStrategy.findMany({
      where: { userId: session.user.id },
      select: { strategyId: true },
    });

    const savedStrategyIds = new Set(savedStrategies.map(s => s.strategyId));

    const strategiesWithSavedStatus = strategies.map(strategy => ({
      ...strategy,
      isSaved: savedStrategyIds.has(strategy.id),
    }));

    return NextResponse.json({
      strategies: strategiesWithSavedStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
