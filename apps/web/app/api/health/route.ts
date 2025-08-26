import { handleApiRoute } from '@/lib/vercel-error-prevention';

export async function GET() {
  return handleApiRoute(
    { method: 'GET' } as Request,
    async () => {
      const startTime = Date.now();
      
      // Check database health (simulated for now)
      const dbHealthy = true; // In production, this would check actual database connection
      
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
    },
    {
      allowedMethods: ['GET'],
      enableRateLimit: true,
      enablePayloadValidation: false
    }
  );
}

// Handle other HTTP methods with proper error responses
export async function POST() {
  return Response.json({ 
    error: 'INVALID_REQUEST_METHOD',
    message: 'Method not allowed',
    status: 405 
  }, { status: 405 });
}

export async function PUT() {
  return Response.json({ 
    error: 'INVALID_REQUEST_METHOD',
    message: 'Method not allowed',
    status: 405 
  }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ 
    error: 'INVALID_REQUEST_METHOD',
    message: 'Method not allowed',
    status: 405 
  }, { status: 405 });
}
