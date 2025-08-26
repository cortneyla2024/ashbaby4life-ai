import { handleApiRoute } from '@/lib/vercel-error-prevention';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      // Simulate user authentication check
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user'
      };

      return Response.json({ user });
    },
    {
      allowedMethods: ['GET'],
      enableRateLimit: true,
      enablePayloadValidation: false
    }
  );
}

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
