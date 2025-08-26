import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const transactionSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).max(100),
  date: z.string().datetime(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  accountId: z.string().optional(),
  recurringId: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  type: z.enum(['income', 'expense', 'all']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

// Mock data store (in production, this would be a database)
let transactions = [
  {
    id: '1',
    userId: 'user-1',
    description: 'Salary',
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2024-01-01').toISOString(),
    notes: 'Monthly salary payment',
    tags: ['work', 'monthly'],
    accountId: 'account-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    description: 'Grocery Shopping',
    amount: 150,
    type: 'expense',
    category: 'Groceries',
    date: new Date('2024-01-02').toISOString(),
    notes: 'Weekly grocery shopping',
    tags: ['food', 'weekly'],
    accountId: 'account-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    description: 'Electric Bill',
    amount: 120,
    type: 'expense',
    category: 'Utilities',
    date: new Date('2024-01-03').toISOString(),
    notes: 'Monthly electricity bill',
    tags: ['utilities', 'monthly'],
    accountId: 'account-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Filter transactions
    let filteredTransactions = transactions.filter(t => t.userId === userId);
    
    // Apply filters
    if (query.type && query.type !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === query.type);
    }
    
    if (query.category) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.category.toLowerCase().includes(query.category!.toLowerCase())
      );
    }
    
    if (query.startDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= new Date(query.startDate!)
      );
    }
    
    if (query.endDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) <= new Date(query.endDate!)
      );
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm) ||
        t.notes?.toLowerCase().includes(searchTerm) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    // Calculate summary statistics
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalIncome - totalExpenses;
    
    // Category breakdown
    const categoryBreakdown = filteredTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0, count: 0 };
      }
      if (t.type === 'income') {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expense += t.amount;
      }
      acc[t.category].count += 1;
      return acc;
    }, {} as Record<string, { income: number; expense: number; count: number }>);
    
    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / query.limit),
      },
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        transactionCount: filteredTransactions.length,
      },
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Create new transaction
    const newTransaction = {
      id: `transaction-${Date.now()}`,
      userId,
      ...validatedData,
      notes: validatedData.notes || '',
      tags: validatedData.tags || [],
      accountId: validatedData.accountId || '',
      recurringId: validatedData.recurringId || '',
      date: new Date(validatedData.date).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    transactions.push(newTransaction);
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction' },
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    const validatedData = transactionSchema.partial().parse(updateData);
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Find and update transaction
    const transactionIndex = transactions.findIndex(
      t => t.id === id && t.userId === userId
    );
    
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(transactions[transactionIndex]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update transaction' },
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Find and delete transaction
    const transactionIndex = transactions.findIndex(
      t => t.id === id && t.userId === userId
    );
    
    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    const deletedTransaction = transactions.splice(transactionIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Transaction deleted successfully',
      transaction: deletedTransaction,
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
