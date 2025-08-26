import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GenesisFoundry } from '@/lib/ai/genesis-foundry';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();
const genesisFoundry = new GenesisFoundry(prisma);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'mine_knowledge':
        await genesisFoundry.minePublicKnowledge();
        return NextResponse.json({
          success: true,
          message: 'Knowledge mining completed successfully'
        });

      case 'train_models':
        await genesisFoundry.trainMicroModels();
        return NextResponse.json({
          success: true,
          message: 'Micro-models training completed successfully'
        });

      case 'build_graph':
        await genesisFoundry.buildKnowledgeGraph();
        return NextResponse.json({
          success: true,
          message: 'Knowledge graph built successfully'
        });

      case 'generate_services':
        await genesisFoundry.generateInternalServices();
        return NextResponse.json({
          success: true,
          message: 'Internal services generated successfully'
        });

      case 'search_knowledge':
        const { query, filters } = data;
        const results = await genesisFoundry.searchKnowledge(query, filters);
        return NextResponse.json({
          success: true,
          results
        });

      case 'discover_programs':
        const { criteria } = data;
        const programs = await genesisFoundry.discoverAssistancePrograms(criteria);
        return NextResponse.json({
          success: true,
          programs
        });

      case 'continuous_learning':
        await genesisFoundry.continuousLearning();
        return NextResponse.json({
          success: true,
          message: 'Continuous learning cycle completed'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Genesis Foundry API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = genesisFoundry.getSystemStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'templates':
        const templates = genesisFoundry.getServiceTemplates();
        return NextResponse.json({
          success: true,
          templates
        });

      case 'models':
        const models = genesisFoundry.getActiveMicroModels();
        return NextResponse.json({
          success: true,
          models
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Genesis Foundry API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
