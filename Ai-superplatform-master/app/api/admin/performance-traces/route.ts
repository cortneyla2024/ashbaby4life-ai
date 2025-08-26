import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Get recent performance traces
    const traces = await prisma.performanceTrace.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    // Get summary statistics
    const totalTraces = await prisma.performanceTrace.count();
    const slowTraces = await prisma.performanceTrace.count({
      where: { isSlow: true },
    });

    // Get average performance by operation type
    const performanceStats = await prisma.performanceTrace.groupBy({
      by: ["operation"],
      _avg: {
        durationMs: true,
      },
      _count: {
        operation: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    return NextResponse.json({
      success: true,
      traces,
      summary: {
        total: totalTraces,
        slow: slowTraces,
        normal: totalTraces - slowTraces,
      },
      performanceStats: performanceStats.map(stat => ({
        operation: stat.operation,
        averageDuration: stat._avg.durationMs,
        count: stat._count.operation,
      })),
    });

  } catch (error) {
    console.error("Failed to fetch performance trace data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch performance trace data" },
      { status: 500 }
    );
  }
}
