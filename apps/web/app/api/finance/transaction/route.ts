import { handleApiRoute } from '@/lib/vercel-error-prevention';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  return handleApiRoute(
    request,
    async () => {
      const transactions = await prisma.financialData.findMany({
        where: {
          type: 'transaction'
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      return Response.json({ transactions });
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
      
      const transaction = await prisma.financialData.create({
        data: {
          type: 'transaction',
          data: JSON.stringify(body),
          userId: body.userId || 'default'
        }
      });

      return Response.json({ transaction });
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
      
      const transaction = await prisma.financialData.update({
        where: { id: body.id },
        data: {
          data: JSON.stringify(body),
          timestamp: new Date()
        }
      });

      return Response.json({ transaction });
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

      await prisma.financialData.delete({
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
