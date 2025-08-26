// Mock NextRequest to avoid import issues
const mockNextRequest = jest.fn().mockImplementation((url: string, options?: any) => ({
  url,
  method: options?.method || 'GET',
  body: options?.body,
  headers: new Map(Object.entries(options?.headers || {})),
  nextUrl: new URL(url),
}));

// Mock the NextRequest constructor
jest.mock('next/server', () => ({
  NextRequest: mockNextRequest,
}));

import { GET, POST, PUT, DELETE } from '@/app/api/finance/budget/route';
import { GET as GET_TRANSACTION, POST as POST_TRANSACTION } from '@/app/api/finance/transaction/route';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    financialData: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Finance API Routes', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = require('@prisma/client').PrismaClient;
  });

  describe('Budget API', () => {
    it('should create a new budget', async () => {
      const mockBudget = {
        id: '1',
        userId: 'user123',
        data: JSON.stringify({
          name: 'Monthly Budget',
          amount: 1000,
          spent: 0,
          category: 'general'
        }),
        timestamp: new Date()
      };

      mockPrisma.mockImplementation(() => ({
        financialData: {
          create: jest.fn().mockResolvedValue(mockBudget),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/budget', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Monthly Budget',
          amount: 1000,
          category: 'general'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.budget).toBeDefined();
    });

    it('should get budgets for a user', async () => {
      const mockBudgets = [
        {
          id: '1',
          userId: 'user123',
          data: JSON.stringify({
            name: 'Monthly Budget',
            amount: 1000,
            spent: 500,
            category: 'general'
          }),
          timestamp: new Date()
        }
      ];

      mockPrisma.mockImplementation(() => ({
        financialData: {
          findMany: jest.fn().mockResolvedValue(mockBudgets),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/budget?userId=user123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.budgets).toHaveLength(1);
    });

    it('should update a budget', async () => {
      const mockUpdatedBudget = {
        id: '1',
        userId: 'user123',
        data: JSON.stringify({
          name: 'Updated Budget',
          amount: 1500,
          spent: 750,
          category: 'general'
        }),
        timestamp: new Date()
      };

      mockPrisma.mockImplementation(() => ({
        financialData: {
          findUnique: jest.fn().mockResolvedValue(mockUpdatedBudget),
          update: jest.fn().mockResolvedValue(mockUpdatedBudget),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/budget/1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Budget',
          amount: 1500
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.budget).toBeDefined();
    });

    it('should delete a budget', async () => {
      mockPrisma.mockImplementation(() => ({
        financialData: {
          findUnique: jest.fn().mockResolvedValue({ id: '1' }),
          delete: jest.fn().mockResolvedValue({ id: '1' }),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/budget/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Transaction API', () => {
    it('should create a new transaction', async () => {
      const mockTransaction = {
        id: '1',
        userId: 'user123',
        data: JSON.stringify({
          amount: 100,
          description: 'Grocery shopping',
          category: 'food',
          type: 'expense',
          date: new Date().toISOString()
        }),
        timestamp: new Date()
      };

      mockPrisma.mockImplementation(() => ({
        financialData: {
          create: jest.fn().mockResolvedValue(mockTransaction),
          findUnique: jest.fn().mockResolvedValue({
            data: JSON.stringify({ spent: 0, amount: 1000 })
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/transaction', {
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          description: 'Grocery shopping',
          category: 'food',
          type: 'expense',
          budgetId: 'budget1'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST_TRANSACTION(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.transaction).toBeDefined();
    });

    it('should get transactions for a user', async () => {
      const mockTransactions = [
        {
          id: '1',
          userId: 'user123',
          data: JSON.stringify({
            amount: 100,
            description: 'Grocery shopping',
            category: 'food',
            type: 'expense',
            date: new Date().toISOString()
          }),
          timestamp: new Date()
        }
      ];

      mockPrisma.mockImplementation(() => ({
        financialData: {
          findMany: jest.fn().mockResolvedValue(mockTransactions),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/transaction?userId=user123');
      const response = await GET_TRANSACTION(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.mockImplementation(() => ({
        financialData: {
          create: jest.fn().mockRejectedValue(new Error('Database error')),
        },
      }));

      const request = mockNextRequest('http://localhost:3000/api/finance/budget', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Budget',
          amount: 1000
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate required fields', async () => {
      const request = mockNextRequest('http://localhost:3000/api/finance/budget', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
