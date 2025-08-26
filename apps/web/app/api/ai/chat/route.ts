import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AscendedAICore } from '@/lib/ai/ascended-core';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();
const aiCore = new AscendedAICore(prisma);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, persona } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Process the message with the AI core
    const response = await aiCore.processUserInput(user.id, message, {
      preferences: {
        aiPersona: persona || user.aiPersona || 'balanced',
        communicationStyle: 'empathetic',
        topics: []
      }
    });

    // Store the interaction for learning
    await aiCore.learnFromInteraction(user.id, message, response);

    // Check for bias
    const hasBias = await aiCore.checkForBias(response);
    if (hasBias) {
      console.warn('Potential bias detected in AI response');
    }

    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        persona: response.persona,
        reasoning: response.reasoning,
        confidence: response.confidence,
        suggestions: response.suggestions,
        emotionalTone: response.emotionalTone
      }
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
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

    // Get chat history for the user
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would typically fetch from a chat history table
    // For now, return empty array as placeholder
    const chatHistory = [];

    return NextResponse.json({
      success: true,
      chatHistory,
      user: {
        id: user.id,
        name: user.name,
        aiPersona: user.aiPersona || 'balanced'
      }
    });

  } catch (error) {
    console.error('AI Chat History API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
