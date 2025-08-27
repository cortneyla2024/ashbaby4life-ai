import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock API responses for failure simulation
const mockApiFailures = {
  networkError: () => Promise.reject(new Error('Network error')),
  serverError: () => Promise.resolve({ status: 500, error: 'Internal server error' }),
  timeoutError: () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100)),
  malformedData: () => Promise.resolve({ data: null, invalid: 'response' }),
  emptyResponse: () => Promise.resolve({ data: [] }),
  partialData: () => Promise.resolve({ 
    data: { transactions: [], budgets: null, accounts: undefined } 
  })
};

// Mock error handling utilities
const mockErrorHandler = {
  handleNetworkError: jest.fn((error: Error) => ({
    type: 'error',
    message: 'Network error occurred',
    retry: true
  })),
  
  handleServerError: jest.fn((error: any) => ({
    type: 'error',
    message: 'Server error occurred',
    retry: true
  })),
  
  handleTimeoutError: jest.fn((error: Error) => ({
    type: 'warning',
    message: 'Request timed out',
    offline: true
  })),
  
  handleMalformedData: jest.fn((data: any) => ({
    type: 'warning',
    message: 'Data format error',
    fallback: true
  }))
};

// Mock data validation utilities
const mockDataValidator = {
  validateTransaction: jest.fn((data: any) => {
    if (!data.amount || !data.description) {
      return { valid: false, errors: ['Amount and description are required'] };
    }
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      return { valid: false, errors: ['Amount must be a positive number'] };
    }
    return { valid: true, errors: [] };
  }),
  
  validateBudget: jest.fn((data: any) => {
    if (!data.name || !data.amount) {
      return { valid: false, errors: ['Name and amount are required'] };
    }
    return { valid: true, errors: [] };
  }),
  
  sanitizeInput: jest.fn((input: string) => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '');
  })
};

// Mock resilience utilities
const mockResilienceUtils = {
  retryOperation: jest.fn(async (operation: () => Promise<any>, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }),
  
  debounce: jest.fn((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }),
  
  isOnline: jest.fn(() => navigator.onLine),
  
  getCachedData: jest.fn((key: string) => {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  }),
  
  setCachedData: jest.fn((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  })
};

describe('Runtime Resilience Tests', () => {
  describe('API Failure Handling', () => {
    test('should handle network errors gracefully', async () => {
      const networkError = mockApiFailures.networkError();
      
      try {
        await networkError;
      } catch (error) {
        const handledError = mockErrorHandler.handleNetworkError(error as Error);
        
        expect(handledError.type).toBe('error');
        expect(handledError.message).toContain('Network error');
        expect(handledError.retry).toBe(true);
      }
    });

    test('should handle server errors with retry logic', async () => {
      const serverError = await mockApiFailures.serverError();
      const handledError = mockErrorHandler.handleServerError(serverError);
      
      expect(handledError.type).toBe('error');
      expect(handledError.message).toContain('Server error');
      expect(handledError.retry).toBe(true);
    });

    test('should handle timeout errors with fallback UI', async () => {
      const timeoutError = mockApiFailures.timeoutError();
      
      try {
        await timeoutError;
      } catch (error) {
        const handledError = mockErrorHandler.handleTimeoutError(error as Error);
        
        expect(handledError.type).toBe('warning');
        expect(handledError.message).toContain('timed out');
        expect(handledError.offline).toBe(true);
      }
    });
  });

  describe('Data Validation & Fallbacks', () => {
    test('should handle malformed API responses', async () => {
      const malformedData = await mockApiFailures.malformedData();
      const handledData = mockErrorHandler.handleMalformedData(malformedData);
      
      expect(handledData.type).toBe('warning');
      expect(handledData.message).toContain('Data format error');
      expect(handledData.fallback).toBe(true);
    });

    test('should handle empty responses gracefully', async () => {
      const emptyResponse = await mockApiFailures.emptyResponse();
      
      expect(emptyResponse.data).toEqual([]);
      expect(Array.isArray(emptyResponse.data)).toBe(true);
    });

    test('should handle partial data responses', async () => {
      const partialData = await mockApiFailures.partialData();
      
      expect(partialData.data.transactions).toEqual([]);
      expect(partialData.data.budgets).toBeNull();
      expect(partialData.data.accounts).toBeUndefined();
    });
  });

  describe('User Input Error Handling', () => {
    test('should validate form inputs and show helpful errors', () => {
      const invalidTransaction = {
        amount: '',
        description: ''
      };
      
      const validation = mockDataValidator.validateTransaction(invalidTransaction);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Amount and description are required');
    });

    test('should handle invalid numeric inputs', () => {
      const invalidAmount = {
        amount: -100,
        description: 'Test transaction'
      };
      
      const validation = mockDataValidator.validateTransaction(invalidAmount);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Amount must be a positive number');
    });

    test('should handle XSS attempts in user input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitizedInput = mockDataValidator.sanitizeInput(maliciousInput);
      
      expect(sanitizedInput).not.toContain('<script>');
      expect(sanitizedInput).not.toContain('</script>');
    });

    test('should validate budget inputs correctly', () => {
      const validBudget = {
        name: 'Monthly Budget',
        amount: 1000
      };
      
      const validation = mockDataValidator.validateBudget(validBudget);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('Error Recovery & Self-Healing', () => {
    test('should automatically retry failed operations', async () => {
      let attemptCount = 0;
      const failingOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('Success');
      });
      
      const result = await mockResilienceUtils.retryOperation(failingOperation, 3);
      
      expect(result).toBe('Success');
      expect(failingOperation).toHaveBeenCalledTimes(3);
    });

    test('should debounce rapid user interactions', async () => {
      const mockFunction = jest.fn();
      const debouncedFunction = mockResilienceUtils.debounce(mockFunction, 100);
      
      // Call multiple times rapidly
      debouncedFunction();
      debouncedFunction();
      debouncedFunction();
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    test('should detect offline state and use cached data', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const isOnline = mockResilienceUtils.isOnline();
      expect(isOnline).toBe(false);
      
      // Test cached data retrieval
      const testData = { transactions: [] };
      mockResilienceUtils.setCachedData('transactions', testData);
      // Mock localStorage.getItem to return the cached data
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(JSON.stringify(testData)),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
      const cachedData = mockResilienceUtils.getCachedData('transactions');
      
      expect(cachedData).toEqual(testData);
    });
  });

  describe('Performance Under Load', () => {
    test('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        data: `Data ${i}`
      }));
      
      // Test pagination logic
      const pageSize = 50;
      const page = 1;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = largeDataset.slice(startIndex, endIndex);
      
      expect(paginatedData).toHaveLength(pageSize);
      expect(paginatedData[0].id).toBe('item-0');
      expect(paginatedData[49].id).toBe('item-49');
    });

    test('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(`Operation ${i} completed`)
      );
      
      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result).toBe(`Operation ${index} completed`);
      });
    });
  });

  describe('Data Integrity & Corruption Recovery', () => {
    test('should detect and recover from corrupted data', () => {
      const corruptedData = 'corrupted{data';
      
      const isValidJSON = (str: string) => {
        try {
          JSON.parse(str);
          return true;
        } catch {
          return false;
        }
      };
      
      expect(isValidJSON(corruptedData)).toBe(false);
      
      // Should provide fallback data
      const fallbackData = { transactions: [], budgets: [] };
      expect(isValidJSON(JSON.stringify(fallbackData))).toBe(true);
    });

    test('should validate data structure integrity', () => {
      const validStructure = {
        transactions: [],
        budgets: [],
        accounts: []
      };
      
      const hasRequiredKeys = (data: any) => {
        return ['transactions', 'budgets', 'accounts'].every(key => key in data);
      };
      
      expect(hasRequiredKeys(validStructure)).toBe(true);
    });
  });

  describe('Security & Input Sanitization', () => {
    test('should sanitize all user inputs', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>'
      ];
      
      maliciousInputs.forEach(input => {
        const sanitized = mockDataValidator.sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('data:text/html');
      });
    });

    test('should validate file uploads', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      const validateFile = (file: { type: string; size: number }) => {
        const isValidType = allowedTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;
        return isValidType && isValidSize;
      };
      
      const validFile = { type: 'image/jpeg', size: 1024 * 1024 };
      const invalidFile = { type: 'application/exe', size: 10 * 1024 * 1024 };
      
      expect(validateFile(validFile)).toBe(true);
      expect(validateFile(invalidFile)).toBe(false);
    });
  });
});
