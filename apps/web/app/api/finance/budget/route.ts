import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, amount, period, categories } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Budget name is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Budget amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!period || !['weekly', 'monthly', 'yearly'].includes(period)) {
      return NextResponse.json(
        { error: 'Period must be weekly, monthly, or yearly' },
        { status: 400 }
      );
    }

    // Create budget
    const budgetData = {
      name,
      amount,
      period,
      categories: categories || [],
      startDate: new Date(),
      isActive: true
    };

    const budget = await prisma.financialData.create({
      data: {
        userId: user.id,
        type: 'budget',
        data: JSON.stringify(budgetData),
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Budget API Error:', error);
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
    const active = searchParams.get('active');

    // Get budgets
    const budgetRecords = await prisma.financialData.findMany({
      where: {
        userId: user.id,
        type: 'budget',
        ...(active === 'true' && {
          data: {
            contains: '"isActive":true'
          }
        })
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const budgets = budgetRecords.map(record => ({
      id: record.id,
      ...JSON.parse(record.data),
      createdAt: record.timestamp
    }));

    return NextResponse.json({
      success: true,
      budgets
    });

  } catch (error) {
    console.error('Budget API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const existingBudget = await prisma.financialData.findFirst({
      where: {
        id,
        userId: user.id,
        type: 'budget'
      }
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Update budget
    const existingData = JSON.parse(existingBudget.data);
    const updatedData = { ...existingData, ...updates };

    const budget = await prisma.financialData.update({
      where: { id },
      data: {
        data: JSON.stringify(updatedData),
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      budget
    });

  } catch (error) {
    console.error('Budget API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const existingBudget = await prisma.financialData.findFirst({
      where: {
        id,
        userId: user.id,
        type: 'budget'
      }
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Delete budget
    await prisma.financialData.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Budget API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
