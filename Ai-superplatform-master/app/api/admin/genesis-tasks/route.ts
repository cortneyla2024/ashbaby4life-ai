import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GenesisTask {
  id: string;
  type: string;
  status: string;
  description: string;
  timestamp: string;
  result?: string;
}

export async function GET(_request: NextRequest) {
  try {
    // For now, we'll create synthetic task data based on recent activities
    // In a real implementation, this would come from a dedicated tasks table

    const tasks: GenesisTask[] = [];
    const now = new Date();

    // Get recent system health logs and create tasks
    const healthLogs = await prisma.systemHealthLog.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    healthLogs.forEach((log) => {
      tasks.push({
        id: `health-${log.id}`,
        type: "HEALTH_CHECK",
        status: log.status === "CRITICAL" ? "FAILED" :
                log.status === "WARNING" ? "RUNNING" : "COMPLETED",
        description: `System health check for ${log.metric}`,
        timestamp: log.createdAt.toISOString(),
        ...(log.notes && { result: log.notes }),
      });
    });

    // Get recent security audit logs and create tasks
    const securityLogs = await prisma.securityAuditLog.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    securityLogs.forEach((log) => {
      tasks.push({
        id: `security-${log.id}`,
        type: "SECURITY_AUDIT",
        status: log.result === "PASSED" ? "COMPLETED" : "FAILED",
        description: `Security audit: ${log.auditType}`,
        timestamp: log.createdAt.toISOString(),
        ...(log.remediationAction && { result: log.remediationAction }),
      });
    });

    // Get recent performance traces and create tasks
    const performanceLogs = await prisma.performanceTrace.findMany({
      where: {
        isSlow: true,
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    performanceLogs.forEach((log) => {
      tasks.push({
        id: `performance-${log.id}`,
        type: "PERFORMANCE_ANALYSIS",
        status: "COMPLETED",
        description: `Performance analysis for ${log.operation}`,
        timestamp: log.createdAt.toISOString(),
        result: `Operation took ${log.durationMs}ms`,
      });
    });

    // Sort tasks by timestamp (most recent first)
    tasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get summary statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const failedTasks = tasks.filter(t => t.status === "FAILED").length;
    const runningTasks = tasks.filter(t => t.status === "RUNNING").length;

    return NextResponse.json({
      success: true,
      tasks: tasks.slice(0, 20), // Return last 20 tasks
      summary: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        running: runningTasks,
      },
    });

  } catch (error) {
    console.error("Failed to fetch Genesis Engine task data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Genesis Engine task data" },
      { status: 500 }
    );
  }
}
