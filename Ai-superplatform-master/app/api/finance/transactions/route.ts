import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";
import { emitAutomationEvent } from "@/lib/automation/event-bus";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { description, amount, type, category, date, notes } = body;

    if (!description || !amount || !type || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        notes,
      },
    });

    // Emit automation event for transaction creation
    emitAutomationEvent("transaction.created", user.id, {
      transactionId: transaction.id,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date),
      notes,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const where: any = {
      userId: user.id,
    };

    if (type) {
where.type = type;
}
    if (category) {
where.category = category;
}
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
where.date.gte = new Date(startDate);
}
      if (endDate) {
where.date.lte = new Date(endDate);
}
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
