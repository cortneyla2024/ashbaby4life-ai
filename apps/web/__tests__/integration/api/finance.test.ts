// Mock the Vercel error prevention system first
jest.mock('@/lib/vercel-error-prevention', () => ({
  handleApiRoute: jest.fn().mockImplementation(async (request: any, operation: any) => {
    return await operation();
  }),
}));

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

// Mock Response for API routes
global.Response = {
  json: jest.fn().mockImplementation((data: any) => ({
    json: () => Promise.resolve(data),
    status: 200,
    headers: new Map(),
  })),
} as any;

// Now import the API routes
import { GET, POST, PUT, DELETE } from '@/app/api/finance/budget/route';
import { GET as GET_TRANSACTION, POST as POST_TRANSACTION } from '@/app/api/finance/transaction/route';

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

      const request = {
        url: 'http://localhost:3000/api/finance/budget',
        method: 'POST',
        body: JSON.stringify({
          name: 'Monthly Budget',
          amount: 1000,
          category: 'general'
        }),
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          name: 'Monthly Budget',
          amount: 1000,
          category: 'general'
        }),
      } as any;

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
            spent: 300,
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

      const request = {
        url: 'http://localhost:3000/api/finance/budget?userId=user123',
        method: 'GET',
        headers: new Map(),
      } as any;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.budgets).toHaveLength(1);
    });

    it('should update a budget', async () => {
      const mockBudget = {
        id: '1',
        userId: 'user123',
        data: JSON.stringify({
          name: 'Updated Budget',
          amount: 1200,
          spent: 400,
          category: 'general'
        }),
        timestamp: new Date()
      };

      mockPrisma.mockImplementation(() => ({
        financialData: {
          update: jest.fn().mockResolvedValue(mockBudget),
        },
      }));

      const request = {
        url: 'http://localhost:3000/api/finance/budget/1',
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Budget',
          amount: 1200,
          category: 'general'
        }),
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          name: 'Updated Budget',
          amount: 1200,
          category: 'general'
        }),
      } as any;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.budget).toBeDefined();
    });

    it('should delete a budget', async () => {
      mockPrisma.mockImplementation(() => ({
        financialData: {
          delete: jest.fn().mockResolvedValue({ id: '1' }),
        },
      }));

      const request = {
        url: 'http://localhost:3000/api/finance/budget/1',
        method: 'DELETE',
        headers: new Map(),
      } as any;

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
          type: 'expense',
          category: 'food',
          date: new Date()
        }),
        timestamp: new Date()
      };

      mockPrisma.mockImplementation(() => ({
        financialData: {
          create: jest.fn().mockResolvedValue(mockTransaction),
        },
      }));

      const request = {
        url: 'http://localhost:3000/api/finance/transaction',
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          description: 'Grocery shopping',
          type: 'expense',
          category: 'food'
        }),
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          amount: 100,
          description: 'Grocery shopping',
          type: 'expense',
          category: 'food'
        }),
      } as any;

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
            type: 'expense',
            category: 'food',
            date: new Date()
          }),
          timestamp: new Date()
        }
      ];

      mockPrisma.mockImplementation(() => ({
        financialData: {
          findMany: jest.fn().mockResolvedValue(mockTransactions),
        },
      }));

      const request = {
        url: 'http://localhost:3000/api/finance/transaction?userId=user123',
        method: 'GET',
        headers: new Map(),
      } as any;

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

      const request = {
        url: 'http://localhost:3000/api/finance/budget',
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Budget',
          amount: 1000,
          category: 'general'
        }),
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          name: 'Test Budget',
          amount: 1000,
          category: 'general'
        }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate required fields', async () => {
      const request = {
        url: 'http://localhost:3000/api/finance/budget',
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        }),
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          // Missing required fields
        }),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
