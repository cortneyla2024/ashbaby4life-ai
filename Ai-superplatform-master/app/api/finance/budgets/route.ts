import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, amount, period } = body;

    if (!name || !category || !amount || !period) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        name,
        category,
        amount: parseFloat(amount),
        period,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category, amount, period } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (amount !== undefined) {
      updateData.amount = parseFloat(amount);
    }
    if (period !== undefined) {
      updateData.period = period;
    }

    const budget = await prisma.budget.update({
      where: {
        id,
        userId: user.id, // Ensure user can only update their own budgets
      },
      data: updateData,
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
