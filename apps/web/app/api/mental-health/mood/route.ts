import { handleApiRoute } from '@/lib/vercel-error-prevention';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      const moodEntries = await prisma.healthData.findMany({
        where: {
          type: 'mood'
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      return Response.json({ moodEntries });
    },
    {
      allowedMethods: ['GET'],
      enableRateLimit: true,
      enablePayloadValidation: false
    }
  );
}

export async function POST(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      const body = await request.json();
      
      const moodEntry = await prisma.healthData.create({
        data: {
          type: 'mood',
          data: JSON.stringify(body),
          userId: body.userId || 'default'
        }
      });

      return Response.json({ moodEntry });
    },
    {
      allowedMethods: ['POST'],
      enableRateLimit: true,
      enablePayloadValidation: true
    }
  );
}

export async function PUT(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      const body = await request.json();
      
      const moodEntry = await prisma.healthData.update({
        where: { id: body.id },
        data: {
          data: JSON.stringify(body),
          timestamp: new Date()
        }
      });

      return Response.json({ moodEntry });
    },
    {
      allowedMethods: ['PUT'],
      enableRateLimit: true,
      enablePayloadValidation: true
    }
  );
}

export async function DELETE(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return Response.json({ 
          error: 'MISSING_PARAMETER',
          message: 'ID parameter is required',
          status: 400 
        }, { status: 400 });
      }

      await prisma.healthData.delete({
        where: { id }
      });

      return Response.json({ success: true });
    },
    {
      allowedMethods: ['DELETE'],
      enableRateLimit: true,
      enablePayloadValidation: false
    }
  );
}
