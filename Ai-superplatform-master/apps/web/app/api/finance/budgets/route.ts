import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const budgetSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  amount: z.number().positive(),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// Mock data store
let budgets = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Monthly Groceries',
    category: 'Groceries',
    amount: 500,
    spent: 320,
    period: 'monthly',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-01-31').toISOString(),
    alertThreshold: 80,
    isActive: true,
    tags: ['food', 'essentials'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Entertainment Budget',
    category: 'Entertainment',
    amount: 200,
    spent: 180,
    period: 'monthly',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-01-31').toISOString(),
    alertThreshold: 90,
    isActive: true,
    tags: ['leisure', 'fun'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Transportation',
    category: 'Transportation',
    amount: 300,
    spent: 250,
    period: 'monthly',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-01-31').toISOString(),
    alertThreshold: 85,
    isActive: true,
    tags: ['transport', 'commute'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to calculate spent amount for a budget
function calculateSpentAmount(budgetId: string, category: string, startDate: string, endDate?: string) {
  // In a real app, this would query the transactions table
  // For now, we'll return the mock spent amount
  const budget = budgets.find(b => b.id === budgetId);
  return budget ? budget.spent : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const period = searchParams.get('period');
    const isActive = searchParams.get('isActive');
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Filter budgets
    let filteredBudgets = budgets.filter(b => b.userId === userId);
    
    if (category) {
      filteredBudgets = filteredBudgets.filter(b => 
        b.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (period) {
      filteredBudgets = filteredBudgets.filter(b => b.period === period);
    }
    
    if (isActive !== null) {
      filteredBudgets = filteredBudgets.filter(b => 
        b.isActive === (isActive === 'true')
      );
    }
    
    // Calculate additional metrics for each budget
    const budgetsWithMetrics = filteredBudgets.map(budget => {
      const percentage = (budget.spent / budget.amount) * 100;
      const remaining = budget.amount - budget.spent;
      const isOverBudget = budget.spent > budget.amount;
      const isNearLimit = percentage >= (budget.alertThreshold || 80);
      
      // Calculate daily/weekly averages based on period
      const now = new Date();
      const startDate = new Date(budget.startDate);
      const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      let dailyAverage = 0;
      let projectedSpend = 0;
      
      if (budget.period === 'monthly') {
        dailyAverage = budget.spent / daysElapsed;
        projectedSpend = dailyAverage * 30;
      } else if (budget.period === 'weekly') {
        dailyAverage = budget.spent / daysElapsed;
        projectedSpend = dailyAverage * 7;
      } else if (budget.period === 'yearly') {
        dailyAverage = budget.spent / daysElapsed;
        projectedSpend = dailyAverage * 365;
      }
      
      return {
        ...budget,
        metrics: {
          percentage: Math.round(percentage * 100) / 100,
          remaining,
          isOverBudget,
          isNearLimit,
          dailyAverage: Math.round(dailyAverage * 100) / 100,
          projectedSpend: Math.round(projectedSpend * 100) / 100,
          daysRemaining: budget.endDate ? 
            Math.max(0, Math.ceil((new Date(budget.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 
            null,
        },
      };
    });
    
    // Calculate overall budget summary
    const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overBudgetCount = budgetsWithMetrics.filter(b => b.metrics.isOverBudget).length;
    const nearLimitCount = budgetsWithMetrics.filter(b => b.metrics.isNearLimit).length;
    
    return NextResponse.json({
      budgets: budgetsWithMetrics,
      summary: {
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallPercentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
        activeBudgets: filteredBudgets.filter(b => b.isActive).length,
        overBudgetCount,
        nearLimitCount,
      },
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = budgetSchema.parse(body);
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Create new budget
    const newBudget = {
      id: `budget-${Date.now()}`,
      userId,
      ...validatedData,
      spent: 0, // Initialize spent amount
      isActive: validatedData.isActive ?? true,
      alertThreshold: validatedData.alertThreshold ?? 80,
      tags: validatedData.tags ?? [],
      startDate: new Date(validatedData.startDate).toISOString(),
      endDate: validatedData.endDate ? new Date(validatedData.endDate).toISOString() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    budgets.push(newBudget);
    
    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }
    
    const validatedData = budgetSchema.partial().parse(updateData);
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Find and update budget
    const budgetIndex = budgets.findIndex(
      b => b.id === id && b.userId === userId
    );
    
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate).toISOString() : budgets[budgetIndex].startDate,
      endDate: validatedData.endDate ? new Date(validatedData.endDate).toISOString() : (budgets[budgetIndex].endDate || ''),
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(budgets[budgetIndex]);
  } catch (error) {
    console.error('Error updating budget:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Find and delete budget
    const budgetIndex = budgets.findIndex(
      b => b.id === id && b.userId === userId
    );
    
    if (budgetIndex === -1) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    const deletedBudget = budgets.splice(budgetIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Budget deleted successfully',
      budget: deletedBudget,
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
