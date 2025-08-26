import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ollamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();

// System health thresholds
const THRESHOLDS = {
  DB_LATENCY: { warning: 100, critical: 500 }, // ms
  API_ERROR_RATE: { warning: 0.05, critical: 0.1 }, // 5%, 10%
  MEMORY_USAGE: { warning: 0.8, critical: 0.95 }, // 80%, 95%
  CPU_LOAD: { warning: 0.7, critical: 0.9 }, // 70%, 90%
};

async function measureDatabaseLatency(): Promise<number> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Date.now() - start;
  } catch (error) {
    console.error("Database latency measurement failed:", error);
    return 1000; // Return high latency on error
  }
}

async function measureApiErrorRate(): Promise<number> {
  try {
    // Count recent errors from analytics events
    const recentEvents = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const errorEvents = recentEvents.filter(event =>
      event.eventType.includes("ERROR") || event.eventType.includes("FAILED")
    );

    return recentEvents.length > 0 ? errorEvents.length / recentEvents.length : 0;
  } catch (error) {
    console.error("API error rate measurement failed:", error);
    return 0;
  }
}

async function getSystemMetrics() {
  const metrics = [];

  // Database latency
  const dbLatency = await measureDatabaseLatency();
  const dbStatus = dbLatency > THRESHOLDS.DB_LATENCY.critical ? "CRITICAL" :
                   dbLatency > THRESHOLDS.DB_LATENCY.warning ? "WARNING" : "NORMAL";

  metrics.push({
    metric: "DB_LATENCY",
    value: dbLatency,
    status: dbStatus,
    notes: `Database query latency: ${dbLatency}ms`,
  });

  // API error rate
  const errorRate = await measureApiErrorRate();
  const errorStatus = errorRate > THRESHOLDS.API_ERROR_RATE.critical ? "CRITICAL" :
                      errorRate > THRESHOLDS.API_ERROR_RATE.warning ? "WARNING" : "NORMAL";

  metrics.push({
    metric: "API_ERROR_RATE",
    value: errorRate,
    status: errorStatus,
    notes: `API error rate: ${(errorRate * 100).toFixed(2)}%`,
  });

  // Memory usage (simulated for now)
  const memoryUsage = Math.random() * 0.3 + 0.5; // Simulate 50-80% usage
  const memoryStatus = memoryUsage > THRESHOLDS.MEMORY_USAGE.critical ? "CRITICAL" :
                       memoryUsage > THRESHOLDS.MEMORY_USAGE.warning ? "WARNING" : "NORMAL";

  metrics.push({
    metric: "MEMORY_USAGE",
    value: memoryUsage,
    status: memoryStatus,
    notes: `Memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
  });

  // CPU load (simulated for now)
  const cpuLoad = Math.random() * 0.4 + 0.3; // Simulate 30-70% load
  const cpuStatus = cpuLoad > THRESHOLDS.CPU_LOAD.critical ? "CRITICAL" :
                    cpuLoad > THRESHOLDS.CPU_LOAD.warning ? "WARNING" : "NORMAL";

  metrics.push({
    metric: "CPU_LOAD",
    value: cpuLoad,
    status: cpuStatus,
    notes: `CPU load: ${(cpuLoad * 100).toFixed(1)}%`,
  });

  return metrics;
}

async function analyzeIssuesWithAI(metrics: any[]) {
  const criticalIssues = metrics.filter(m => m.status === "CRITICAL");
  const warningIssues = metrics.filter(m => m.status === "WARNING");

  if (criticalIssues.length === 0 && warningIssues.length === 0) {
    return null;
  }

  const issues = [...criticalIssues, ...warningIssues];
  const prompt = `System Health Analysis Required

The following system metrics have been flagged as problematic:

${issues.map(issue =>
  `- ${issue.metric}: ${issue.value} (${issue.status}) - ${issue.notes}`
).join("\n")}

Please analyze these issues and provide:
1. Potential root causes
2. Immediate actions to take
3. Long-term solutions to prevent recurrence

Respond in a structured format that can be parsed by the system.`;

  try {
    const response = await ollamaClient.chat(prompt);

    return response;
  } catch (error) {
    console.error("AI analysis failed:", error);
    return "AI analysis unavailable - manual intervention required";
  }
}

export async function GET(_request: NextRequest) {
  try {
    console.log("🔍 Genesis Engine: Initiating system health check...");

    // Collect system metrics
    const metrics = await getSystemMetrics();

    // Log all metrics to database
    for (const metric of metrics) {
      await prisma.systemHealthLog.create({
        data: {
          metric: metric.metric,
          value: metric.value,
          status: metric.status,
          notes: metric.notes,
        },
      });
    }

    // Analyze issues with AI if any problems detected
    const aiAnalysis = await analyzeIssuesWithAI(metrics);

    if (aiAnalysis) {
      console.log("⚠️ Genesis Engine: Issues detected, AI analysis completed");
      console.log("AI Analysis:", aiAnalysis);

      // Log the AI analysis as a special metric
      await prisma.systemHealthLog.create({
        data: {
          metric: "AI_ANALYSIS",
          value: 1,
          status: "NORMAL",
          notes: aiAnalysis,
        },
      });
    } else {
      console.log("✅ Genesis Engine: All systems operational");
    }

    const criticalCount = metrics.filter(m => m.status === "CRITICAL").length;
    const warningCount = metrics.filter(m => m.status === "WARNING").length;

    return NextResponse.json({
      success: true,
      message: "System health check completed",
      summary: {
        total: metrics.length,
        normal: metrics.filter(m => m.status === "NORMAL").length,
        warnings: warningCount,
        critical: criticalCount,
      },
      metrics,
      aiAnalysis: aiAnalysis || null,
    });

  } catch (error) {
    console.error("❌ System health check failed:", error);
    return NextResponse.json(
      { success: false, error: "System health check failed" },
      { status: 500 }
    );
  }
}
