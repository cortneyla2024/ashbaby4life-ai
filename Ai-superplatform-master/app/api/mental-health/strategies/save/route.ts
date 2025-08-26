import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";

// POST /api/mental-health/strategies/save
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { strategyId } = await request.json();

    // Validate input
    if (!strategyId) {
      return NextResponse.json({ error: "Strategy ID is required" }, { status: 400 });
    }

    // Check if strategy exists
    const strategy = await prisma.copingStrategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedStrategy.findUnique({
      where: {
        userId_strategyId: {
          userId: session.user.id,
          strategyId,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json({ error: "Strategy already saved" }, { status: 409 });
    }

    // Save the strategy
    const savedStrategy = await prisma.savedStrategy.create({
      data: {
        userId: session.user.id,
        strategyId,
      },
      include: {
        strategy: true,
      },
    });

    return NextResponse.json(savedStrategy);
  } catch (error) {
    console.error("Error saving strategy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/mental-health/strategies/save
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("strategyId");

    if (!strategyId) {
      return NextResponse.json({ error: "Strategy ID is required" }, { status: 400 });
    }

    // Delete the saved strategy
    await prisma.savedStrategy.deleteMany({
      where: {
        userId: session.user.id,
        strategyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing saved strategy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
