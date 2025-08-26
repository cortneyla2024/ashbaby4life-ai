import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { currentAmount } = body;

    if (currentAmount === undefined) {
      return NextResponse.json(
        { error: "Current amount is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.financialGoal.update({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only update their own goals
      },
      data: {
        currentAmount: parseFloat(currentAmount),
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating financial goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
