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

    const { type, amount, category, description, budgetId, tags, date } = await request.json();

    // Validate input
    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be income or expense' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Verify budget exists if provided
    if (budgetId) {
      const budget = await prisma.financialData.findFirst({
        where: {
          id: budgetId,
          userId: user.id,
          type: 'budget'
        }
      });

      if (!budget) {
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        );
      }
    }

    // Create transaction
    const transactionData = {
      type,
      amount,
      category,
      description,
      budgetId: budgetId || null,
      tags: tags || [],
      date: date ? new Date(date) : new Date()
    };

    const transaction = await prisma.financialData.create({
      data: {
        userId: user.id,
        type: 'transaction',
        data: JSON.stringify(transactionData),
        timestamp: new Date()
      }
    });

    // Update budget spent amount if transaction is an expense and has a budget
    if (type === 'expense' && budgetId) {
      const budgetRecord = await prisma.financialData.findFirst({
        where: {
          id: budgetId,
          userId: user.id,
          type: 'budget'
        }
      });

      if (budgetRecord) {
        const budgetData = JSON.parse(budgetRecord.data);
        const currentSpent = budgetData.spent || 0;
        budgetData.spent = currentSpent + amount;

        await prisma.financialData.update({
          where: { id: budgetId },
          data: {
            data: JSON.stringify(budgetData),
            timestamp: new Date()
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Transaction API Error:', error);
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
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const budgetId = searchParams.get('budgetId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for FinancialData
    const where: any = {
      userId: user.id,
      type: 'transaction'
    };

    // Get transactions
    const transactionRecords = await prisma.financialData.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Parse transaction data and apply filters
    let transactions = transactionRecords.map(record => ({
      id: record.id,
      ...JSON.parse(record.data),
      date: new Date(JSON.parse(record.data).date)
    }));

    // Apply filters after parsing
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (budgetId) {
      transactions = transactions.filter(t => t.budgetId === budgetId);
    }
    if (startDate) {
      transactions = transactions.filter(t => t.date >= new Date(startDate));
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= new Date(endDate));
    }

    // Get total count for pagination
    const totalCount = transactionRecords.length;

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses
      }
    });

  } catch (error) {
    console.error('Transaction API Error:', error);
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user
    const existingTransaction = await prisma.financialData.findFirst({
      where: {
        id,
        userId: user.id,
        type: 'transaction'
      }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const existingData = JSON.parse(existingTransaction.data);

    // If amount is being updated and transaction has a budget, update budget spent
    if (updates.amount && existingData.budgetId && existingData.type === 'expense') {
      const amountDifference = updates.amount - existingData.amount;
      const budgetRecord = await prisma.financialData.findFirst({
        where: {
          id: existingData.budgetId,
          userId: user.id,
          type: 'budget'
        }
      });

      if (budgetRecord) {
        const budgetData = JSON.parse(budgetRecord.data);
        const currentSpent = budgetData.spent || 0;
        budgetData.spent = currentSpent + amountDifference;

        await prisma.financialData.update({
          where: { id: existingData.budgetId },
          data: {
            data: JSON.stringify(budgetData),
            timestamp: new Date()
          }
        });
      }
    }

    // Update transaction
    const updatedData = { ...existingData, ...updates };
    const transaction = await prisma.financialData.update({
      where: { id },
      data: {
        data: JSON.stringify(updatedData),
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Transaction API Error:', error);
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user
    const existingTransaction = await prisma.financialData.findFirst({
      where: {
        id,
        userId: user.id,
        type: 'transaction'
      }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const existingData = JSON.parse(existingTransaction.data);

    // If transaction has a budget and is an expense, update budget spent
    if (existingData.budgetId && existingData.type === 'expense') {
      const budgetRecord = await prisma.financialData.findFirst({
        where: {
          id: existingData.budgetId,
          userId: user.id,
          type: 'budget'
        }
      });

      if (budgetRecord) {
        const budgetData = JSON.parse(budgetRecord.data);
        const currentSpent = budgetData.spent || 0;
        budgetData.spent = currentSpent - existingData.amount;

        await prisma.financialData.update({
          where: { id: existingData.budgetId },
          data: {
            data: JSON.stringify(budgetData),
            timestamp: new Date()
          }
        });
      }
    }

    // Delete transaction
    await prisma.financialData.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Transaction API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
