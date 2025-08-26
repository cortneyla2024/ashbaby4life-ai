import { handleApiRoute, checkDatabaseHealth } from '@/lib/error-handler';

export async function GET() {
  return handleApiRoute(async () => {
    const startTime = Date.now();
    
    // Check database health
    const dbHealthy = await checkDatabaseHealth();
    
    // Check environment variables
    const envCheck = {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    };

    // Check system resources
    const systemCheck = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = dbHealthy && responseTime < 5000; // 5 second threshold

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        environment: Object.values(envCheck).every(Boolean) ? 'healthy' : 'unhealthy',
        system: 'healthy',
      },
      environment: envCheck,
      system: systemCheck,
      version: '5.0.0',
      deployment: 'vercel',
    };

    return Response.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }, 'Health check failed');
}

// Handle other HTTP methods
export async function POST() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
