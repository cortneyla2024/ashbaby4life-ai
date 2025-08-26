import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Get recent system health logs
    const logs = await prisma.systemHealthLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Get summary statistics
    const totalLogs = await prisma.systemHealthLog.count();
    const criticalLogs = await prisma.systemHealthLog.count({
      where: { status: "CRITICAL" },
    });
    const warningLogs = await prisma.systemHealthLog.count({
      where: { status: "WARNING" },
    });

    return NextResponse.json({
      success: true,
      logs,
      summary: {
        total: totalLogs,
        critical: criticalLogs,
        warning: warningLogs,
        normal: totalLogs - criticalLogs - warningLogs,
      },
    });

  } catch (error) {
    console.error("Failed to fetch system health data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system health data" },
      { status: 500 }
    );
  }
}
