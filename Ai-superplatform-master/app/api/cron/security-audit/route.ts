import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ollamaClient } from "@/lib/ai/ollama-client";
import { exec } from "child_process";
import { promisify } from "util";

const prisma = new PrismaClient();

const execAsync = promisify(exec);

async function performDependencyScan() {
  try {
    console.log("🔍 Genesis Engine: Scanning dependencies for vulnerabilities...");

    // Run npm audit and capture output
    const { stdout, stderr } = await execAsync("npm audit --json", {
      cwd: process.cwd(),
      timeout: 30000, // 30 second timeout
    });

    if (stderr) {
      console.warn("npm audit stderr:", stderr);
    }

    const auditResult = JSON.parse(stdout);

    // Check for vulnerabilities
    const vulnerabilities = auditResult.vulnerabilities || {};
    const vulnerabilityCount = Object.keys(vulnerabilities).length;

    let result = "PASSED";
    const details = { vulnerabilities: [], summary: auditResult.metadata };
    let remediationAction = null;

    if (vulnerabilityCount > 0) {
      result = "VULNERABILITY_FOUND";
      details.vulnerabilities = Object.values(vulnerabilities);

      // Generate AI remediation plan
      const vulnerabilityList = Object.entries(vulnerabilities).map(([name, vuln]: [string, any]) =>
        `- ${name}: ${vuln.title} (Severity: ${vuln.severity})`
      ).join("\n");

      const prompt = `Security Vulnerability Analysis Required

The following vulnerabilities were found in the system dependencies:

${vulnerabilityList}

Please provide a detailed remediation plan including:
1. Immediate actions to take (e.g., package updates, patches)
2. Alternative packages if current ones are compromised
3. Security best practices to implement
4. Timeline for remediation

Respond in a structured format that can be executed by the system.`;

      try {
        const aiResponse = await ollamaClient.chat(prompt);
        remediationAction = aiResponse;
      } catch (error) {
        console.error("AI remediation plan generation failed:", error);
        remediationAction = "Manual review required for vulnerability remediation";
      }
    }

    // Log the audit result
    await prisma.securityAuditLog.create({
      data: {
        auditType: "DEPENDENCY_SCAN",
        result,
        remediationAction,
      },
    });

    return {
      type: "DEPENDENCY_SCAN",
      result,
      vulnerabilityCount,
      remediationAction,
    };

  } catch (error) {
    console.error("❌ Dependency scan failed:", error);

    await prisma.securityAuditLog.create({
      data: {
        auditType: "DEPENDENCY_SCAN",
        result: "FAILED",
        remediationAction: "Check npm configuration and network connectivity",
      },
    });

    return {
      type: "DEPENDENCY_SCAN",
      result: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function performAuthPolicyValidation() {
  try {
    console.log("🔍 Genesis Engine: Validating authentication policies...");

    // Test critical API endpoints for proper authentication
    const endpointsToTest = [
      "/api/ai/chat",
      "/api/finance/summary",
      "/api/mental-health/assessment",
      "/api/social/communities",
    ];

    const testResults = [];
    let failedTests = 0;

    for (const endpoint of endpointsToTest) {
      try {
        // Test without authentication
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true }),
        });

        // Should return 401 Unauthorized
        if (response.status === 401) {
          testResults.push({ endpoint, status: "PASSED", message: "Properly requires authentication" });
        } else {
          testResults.push({ endpoint, status: "FAILED", message: `Expected 401, got ${response.status}` });
          failedTests++;
        }
      } catch (error) {
        testResults.push({ endpoint, status: "ERROR", message: error instanceof Error ? error.message : String(error) });
        failedTests++;
      }
    }

    const result = failedTests === 0 ? "PASSED" : "FAILED";
    let remediationAction = null;

    if (failedTests > 0) {
      const failedEndpoints = testResults.filter(t => t.status === "FAILED");
      const prompt = `Authentication Policy Validation Failed

The following endpoints failed authentication validation:

${failedEndpoints.map(f => `- ${f.endpoint}: ${f.message}`).join("\n")}

Please provide a remediation plan to:
1. Fix the authentication middleware for these endpoints
2. Ensure proper authorization checks are in place
3. Implement consistent error handling for unauthorized requests
4. Add security headers and rate limiting if missing

Respond with specific code changes and configuration updates needed.`;

      try {
        const aiResponse = await ollamaClient.chat(prompt);
        remediationAction = aiResponse;
      } catch (error) {
        console.error("AI remediation plan generation failed:", error);
        remediationAction = "Manual review required for authentication policy fixes";
      }
    }

    // Log the validation result
    await prisma.securityAuditLog.create({
      data: {
        auditType: "AUTH_POLICY_CHECK",
        result,
        remediationAction,
      },
    });

    return {
      type: "AUTH_POLICY_CHECK",
      result,
      failedTests,
      testResults,
      remediationAction,
    };

  } catch (error) {
    console.error("❌ Auth policy validation failed:", error);

    await prisma.securityAuditLog.create({
      data: {
        auditType: "AUTH_POLICY_CHECK",
        result: "FAILED",
        remediationAction: "Check server configuration and endpoint availability",
      },
    });

    return {
      type: "AUTH_POLICY_CHECK",
      result: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function performInputValidationTest() {
  try {
    console.log("🔍 Genesis Engine: Testing input validation...");

    // Test various input validation scenarios
    const testCases = [
      {
        name: "SQL Injection Test",
        endpoint: "/api/ai/chat",
        payload: { message: "'; DROP TABLE users; --" },
        expectedResult: "REJECTED",
      },
      {
        name: "XSS Test",
        endpoint: "/api/ai/chat",
        payload: { message: "<script>alert(\"xss\")</script>" },
        expectedResult: "SANITIZED",
      },
      {
        name: "Large Payload Test",
        endpoint: "/api/ai/chat",
        payload: { message: "A".repeat(10000) },
        expectedResult: "REJECTED",
      },
    ];

    const testResults = [];
    let failedTests = 0;

    for (const testCase of testCases) {
      try {
        const response = await fetch(`http://localhost:3000${testCase.endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testCase.payload),
        });

        // For now, we'll assume proper validation if we get a response
        // In a real implementation, we'd check the actual response content
        const result = response.status === 400 || response.status === 413 ? "REJECTED" : "ACCEPTED";

        testResults.push({
          name: testCase.name,
          expected: testCase.expectedResult,
          actual: result,
          status: result === testCase.expectedResult ? "PASSED" : "FAILED",
        });

        if (result !== testCase.expectedResult) {
          failedTests++;
        }
      } catch (error) {
        testResults.push({
          name: testCase.name,
          expected: testCase.expectedResult,
          actual: "ERROR",
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
        });
        failedTests++;
      }
    }

    const result = failedTests === 0 ? "PASSED" : "FAILED";
    let remediationAction = null;

    if (failedTests > 0) {
      const failedCases = testResults.filter(t => t.status === "FAILED");
      const prompt = `Input Validation Test Failed

The following input validation tests failed:

${failedCases.map(f => `- ${f.name}: Expected ${f.expected}, got ${f.actual}`).join("\n")}

Please provide a remediation plan to:
1. Implement proper input sanitization
2. Add request size limits
3. Implement SQL injection protection
4. Add XSS protection headers
5. Create comprehensive input validation middleware

Respond with specific security measures and code implementations needed.`;

      try {
        const aiResponse = await ollamaClient.chat(prompt);
        remediationAction = aiResponse;
      } catch (error) {
        console.error("AI remediation plan generation failed:", error);
        remediationAction = "Manual review required for input validation fixes";
      }
    }

    // Log the validation result
    await prisma.securityAuditLog.create({
      data: {
        auditType: "INPUT_VALIDATION_TEST",
        result,
        remediationAction,
      },
    });

    return {
      type: "INPUT_VALIDATION_TEST",
      result,
      failedTests,
      testResults,
      remediationAction,
    };

  } catch (error) {
    console.error("❌ Input validation test failed:", error);

    await prisma.securityAuditLog.create({
      data: {
        auditType: "INPUT_VALIDATION_TEST",
        result: "FAILED",
        remediationAction: "Check server configuration and validation middleware",
      },
    });

    return {
      type: "INPUT_VALIDATION_TEST",
      result: "FAILED",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET(_request: NextRequest) {
  try {
    console.log("🛡️ Genesis Engine: Initiating security audit...");

    const auditResults = [];

    // Perform dependency scan
    const dependencyResult = await performDependencyScan();
    auditResults.push(dependencyResult);

    // Perform auth policy validation
    const authResult = await performAuthPolicyValidation();
    auditResults.push(authResult);

    // Perform input validation test
    const inputResult = await performInputValidationTest();
    auditResults.push(inputResult);

    // Summary
    const totalTests = auditResults.length;
    const passedTests = auditResults.filter(r => r.result === "PASSED").length;
    const failedTests = totalTests - passedTests;

    console.log(`✅ Genesis Engine: Security audit completed - ${passedTests}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: "Security audit completed",
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
      },
      results: auditResults,
    });

  } catch (error) {
    console.error("❌ Security audit failed:", error);
    return NextResponse.json(
      { success: false, error: "Security audit failed" },
      { status: 500 }
    );
  }
}
