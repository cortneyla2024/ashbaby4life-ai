import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Mock global objects
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root: null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  takeRecords() { return []; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock all context providers
jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'auth-provider' }, children),
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
  }),
}));

jest.mock('@/context/FinanceContext', () => ({
  FinanceProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'finance-provider' }, children),
  useFinance: () => ({
    budgets: [],
    transactions: [],
    loading: false,
    error: null,
    createBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    getBudgetStats: jest.fn().mockReturnValue({
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      percentageUsed: 0
    }),
  }),
}));

jest.mock('@/context/AIAssistantContext', () => ({
  AIAssistantProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'ai-assistant-provider' }, children),
  useAIAssistant: () => ({
    messages: [],
    loading: false,
    persona: 'balanced',
    settings: {
      maxTokens: 1000,
      temperature: 0.7,
      model: 'gpt-3.5-turbo'
    },
    sendMessage: jest.fn(),
    updatePersona: jest.fn(),
    updateSettings: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));

// Mock all hooks
jest.mock('@/hooks/useFinance', () => ({
  useFinance: () => ({
    budgets: [],
    transactions: [],
    loading: false,
    error: null,
    createBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    getBudgetStats: jest.fn().mockReturnValue({
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      percentageUsed: 0
    }),
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAIAssistant', () => ({
  useAIAssistant: () => ({
    messages: [],
    loading: false,
    persona: 'balanced',
    settings: {
      maxTokens: 1000,
      temperature: 0.7,
      model: 'gpt-3.5-turbo'
    },
    sendMessage: jest.fn(),
    updatePersona: jest.fn(),
    updateSettings: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));

// Mock AI services
jest.mock('@/lib/ai/ascended-core', () => ({
  generateAIResponse: jest.fn().mockResolvedValue('AI response message'),
  analyzeUserContext: jest.fn().mockResolvedValue({}),
  generatePersonalizedResponse: jest.fn().mockResolvedValue('Personalized response'),
}));

jest.mock('@/lib/ai/genesis-foundry', () => ({
  generateKnowledgeResponse: jest.fn().mockResolvedValue('Knowledge response'),
  analyzeKnowledgeContext: jest.fn().mockResolvedValue({}),
}));

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    financialData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    healthData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    learningData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock database
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    financialData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    healthData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    learningData: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock authentication
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockReturnValue('mockToken'),
  verifyToken: jest.fn().mockReturnValue({ userId: '1' }),
}));

// Mock Ollama
jest.mock('@/lib/ollama', () => ({
  generateResponse: jest.fn().mockResolvedValue('Ollama response'),
  streamResponse: jest.fn().mockResolvedValue('Streamed response'),
}));

// Export test utilities
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBudgets = [
  {
    id: '1',
    name: 'Groceries',
    amount: 500,
    spent: 300,
    category: 'Food',
    period: 'monthly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockTransactions = [
  {
    id: '1',
    description: 'Grocery shopping',
    amount: 50,
    type: 'expense',
    category: 'Food',
    date: new Date('2024-01-15'),
    budgetId: '1',
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => 
  React.createElement('div', { 'data-testid': 'test-wrapper' }, children);
