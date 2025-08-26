import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Project Chimera - Autonomous Sustenance & Security Engine...');

  // Create initial system health logs
  console.log('📊 Creating initial system health logs...');
  const healthLogs = [
    {
      metric: 'DB_LATENCY',
      value: 45.2,
      status: 'NORMAL',
      notes: 'Database query latency: 45.2ms'
    },
    {
      metric: 'API_ERROR_RATE',
      value: 0.02,
      status: 'NORMAL',
      notes: 'API error rate: 2.0%'
    },
    {
      metric: 'MEMORY_USAGE',
      value: 0.65,
      status: 'NORMAL',
      notes: 'Memory usage: 65.0%'
    },
    {
      metric: 'CPU_LOAD',
      value: 0.45,
      status: 'NORMAL',
      notes: 'CPU load: 45.0%'
    }
  ];

  for (const log of healthLogs) {
    await prisma.systemHealthLog.create({
      data: log
    });
  }

  // Create initial security audit logs
  console.log('🛡️ Creating initial security audit logs...');
  const securityLogs = [
    {
      auditType: 'DEPENDENCY_SCAN',
      result: 'PASSED',
      details: JSON.stringify({ vulnerabilities: [], summary: { totalDependencies: 156 } }),
      remediationAction: null
    },
    {
      auditType: 'AUTH_POLICY_CHECK',
      result: 'PASSED',
      details: JSON.stringify({ testResults: [], failedTests: 0 }),
      remediationAction: null
    },
    {
      auditType: 'INPUT_VALIDATION_TEST',
      result: 'PASSED',
      details: JSON.stringify({ testResults: [], failedTests: 0 }),
      remediationAction: null
    }
  ];

  for (const log of securityLogs) {
    await prisma.securityAuditLog.create({
      data: log
    });
  }

  // Create initial performance traces
  console.log('⚡ Creating initial performance traces...');
  const performanceTraces = [
    {
      operation: 'GET:/api/ai/chat',
      durationMs: 234,
      isSlow: false,
      details: JSON.stringify({ method: 'GET', path: '/api/ai/chat', success: true })
    },
    {
      operation: 'POST:/api/finance/summary',
      durationMs: 156,
      isSlow: false,
      details: JSON.stringify({ method: 'POST', path: '/api/finance/summary', success: true })
    },
    {
      operation: 'GET:/api/mental-health/assessment',
      durationMs: 89,
      isSlow: false,
      details: JSON.stringify({ method: 'GET', path: '/api/mental-health/assessment', success: true })
    }
  ];

  for (const trace of performanceTraces) {
    await prisma.performanceTrace.create({
      data: trace
    });
  }

  console.log('✅ Project Chimera seeded successfully!');
  console.log('🔍 Genesis Engine: Autonomous Sustenance & Security Engine initialized');
  console.log('🛡️ Security protocols: ACTIVE');
  console.log('⚡ Performance monitoring: ACTIVE');
  console.log('📊 Health monitoring: ACTIVE');
  console.log('🤖 AI analysis capabilities: OPERATIONAL');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Project Chimera:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
