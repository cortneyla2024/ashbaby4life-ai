import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Get recent security audit logs
    const logs = await prisma.securityAuditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Get summary statistics
    const totalAudits = await prisma.securityAuditLog.count();
    const passedAudits = await prisma.securityAuditLog.count({
      where: { result: "PASSED" },
    });
    const failedAudits = await prisma.securityAuditLog.count({
      where: { result: "FAILED" },
    });
    const vulnerabilityAudits = await prisma.securityAuditLog.count({
      where: { result: "VULNERABILITY_FOUND" },
    });

    return NextResponse.json({
      success: true,
      logs,
      summary: {
        total: totalAudits,
        passed: passedAudits,
        failed: failedAudits,
        vulnerabilities: vulnerabilityAudits,
      },
    });

  } catch (error) {
    console.error("Failed to fetch security audit data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch security audit data" },
      { status: 500 }
    );
  }
}
