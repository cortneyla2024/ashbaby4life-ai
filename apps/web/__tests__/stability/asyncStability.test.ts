/**
 * Async Stability Test Suite
 * Validates all async operations to prevent freezing and deadlocks
 */

import { 
  withStability, 
  withAPIStability, 
  withUIStability, 
  withLongRunningStability,
  withBatchStability,
  debounceAsync,
  throttleAsync,
  CircuitBreaker,
  withCircuitBreaker,
  withResourceCleanup,
  withProgress
} from '../../lib/stability/asyncWrapper';
import { stabilityMonitor } from '../../lib/stability/monitor';

describe('Async Stability Tests', () => {
  beforeEach(() => {
    // Reset stability monitor
    stabilityMonitor.stopMonitoring();
  });

  afterEach(() => {
    // Clean up any remaining timeouts
    jest.clearAllTimers();
  });

  describe('withStability', () => {
    it('should handle successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withStability(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.retries).toBe(0);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle failed operations with retries', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await withStability(operation, { retries: 2 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.retries).toBe(2);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should handle timeout', async () => {
      const operation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      const result = await withStability(operation, { timeout: 100 });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timed out');
      expect(result.retries).toBe(3); // Default retries
    });

    it('should call error handlers', async () => {
      const onError = jest.fn();
      const onTimeout = jest.fn();
      const onRetry = jest.fn();
      
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await withStability(operation, { 
        retries: 1, 
        onError, 
        onTimeout, 
        onRetry 
      });
      
      expect(onError).toHaveBeenCalled();
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('withAPIStability', () => {
    it('should handle API calls with appropriate timeouts', async () => {
      const apiCall = jest.fn().mockResolvedValue({ data: 'api response' });
      
      const result = await withAPIStability(apiCall);
      
      expect(result).toEqual({ data: 'api response' });
      expect(apiCall).toHaveBeenCalledTimes(1);
    });

    it('should throw error for failed API calls', async () => {
      const apiCall = jest.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(withAPIStability(apiCall)).rejects.toThrow('API call failed');
    });
  });

  describe('withUIStability', () => {
    it('should handle UI operations with shorter timeouts', async () => {
      const uiOperation = jest.fn().mockResolvedValue('ui result');
      
      const result = await withUIStability(uiOperation);
      
      expect(result).toBe('ui result');
    });

    it('should throw error for slow UI operations', async () => {
      const uiOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 6000))
      );
      
      await expect(withUIStability(uiOperation)).rejects.toThrow('UI operation failed');
    }, 15000); // Increase timeout for this test
  });

  describe('withLongRunningStability', () => {
    it('should handle long-running operations', async () => {
      const longOperation = jest.fn().mockResolvedValue('long result');
      
      const result = await withLongRunningStability(longOperation);
      
      expect(result).toBe('long result');
    });

    it('should handle very long operations', async () => {
      const veryLongOperation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 70000))
      );
      
      await expect(withLongRunningStability(veryLongOperation)).rejects.toThrow('Long-running operation failed');
    }, 15000); // Increase timeout for this test
  });

  describe('withBatchStability', () => {
    it('should handle batch operations', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockResolvedValue('result2'),
        jest.fn().mockResolvedValue('result3')
      ];
      
      const results = await withBatchStability(operations);
      
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].data).toBe('result1');
      expect(results[1].success).toBe(true);
      expect(results[1].data).toBe('result2');
      expect(results[2].success).toBe(true);
      expect(results[2].data).toBe('result3');
    });

    it('should handle mixed batch results', async () => {
      const operations = [
        jest.fn().mockResolvedValue('success'),
        jest.fn().mockRejectedValue(new Error('failure')),
        jest.fn().mockResolvedValue('success2')
      ];
      
      const results = await withBatchStability(operations);
      
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe('debounceAsync', () => {
    it('should debounce async operations', async () => {
      const operation = jest.fn().mockResolvedValue('debounced');
      const debouncedOp = debounceAsync(operation, 100);
      
      // Call multiple times quickly
      const promises = [
        debouncedOp(),
        debouncedOp(),
        debouncedOp()
      ];
      
      const results = await Promise.all(promises);
      
      expect(results).toEqual(['debounced', 'debounced', 'debounced']);
      expect(operation).toHaveBeenCalledTimes(1); // Should only execute once
    }, 15000); // Increase timeout for this test
  });

  describe('throttleAsync', () => {
    it('should throttle async operations', async () => {
      const operation = jest.fn().mockResolvedValue('throttled');
      const throttledOp = throttleAsync(operation, 100);
      
      // Call multiple times quickly
      const promises = [
        throttledOp(),
        throttledOp(),
        throttledOp()
      ];
      
      const results = await Promise.all(promises);
      
      // All should return the same result since they're throttled
      expect(results).toEqual(['throttled', 'throttled', 'throttled']);
      expect(operation).toHaveBeenCalledTimes(1); // Should only execute once
    });
  });

  describe('CircuitBreaker', () => {
    it('should open circuit after failures', async () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));
      
      // First failure
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Failure');
      expect(circuitBreaker.getState()).toBe('CLOSED');
      
      // Second failure - should open circuit
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Failure');
      expect(circuitBreaker.getState()).toBe('OPEN');
      
      // Third call should fail immediately
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker is OPEN');
    });

    it('should close circuit after successful operation', async () => {
      const circuitBreaker = new CircuitBreaker(2, 1000);
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('Success');
      
      // First failure
      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Failure');
      
      // Second call succeeds
      const result = await circuitBreaker.execute(operation);
      expect(result).toBe('Success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('withResourceCleanup', () => {
    it('should cleanup resources after operation', async () => {
      const operation = jest.fn().mockResolvedValue('result');
      const cleanup = jest.fn();
      
      const result = await withResourceCleanup(operation, cleanup);
      
      expect(result).toBe('result');
      expect(cleanup).toHaveBeenCalled();
    });

    it('should cleanup even if operation fails', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const cleanup = jest.fn();
      
      await expect(withResourceCleanup(operation, cleanup)).rejects.toThrow('Operation failed');
      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('withProgress', () => {
    it('should track progress', async () => {
      const operation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      const onProgress = jest.fn();
      
      const result = await withProgress(operation, onProgress);
      
      expect(result).toBe(undefined);
      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });
  });

  describe('Stability Monitor Integration', () => {
    it('should record errors in stability monitor', async () => {
      const recordErrorSpy = jest.spyOn(stabilityMonitor, 'recordError');
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await withStability(operation, { retries: 0 });
      
      expect(recordErrorSpy).toHaveBeenCalled();
    });

    it('should not freeze during heavy load', async () => {
      const operations = Array.from({ length: 100 }, () => 
        jest.fn().mockResolvedValue('result')
      );
      
      const startTime = Date.now();
      const results = await withBatchStability(operations);
      const endTime = Date.now();
      
      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    }, 15000); // Increase timeout for this test

    it('should handle concurrent operations without deadlocks', async () => {
      const operation = jest.fn().mockResolvedValue('concurrent');
      
      const promises = Array.from({ length: 10 }, () => 
        withStability(operation)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBe('concurrent');
      });
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not accumulate memory during repeated operations', async () => {
      const operation = jest.fn().mockResolvedValue('memory test');
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await withStability(operation);
      }
      
      // Check that stability monitor doesn't accumulate too much data
      const metrics = stabilityMonitor.getMetrics();
      expect(metrics.length).toBeLessThan(1000); // Should be cleaned up
    });

    it('should cleanup intervals and timeouts', async () => {
      const operation = jest.fn().mockResolvedValue('cleanup test');
      
      // Create many operations with timeouts
      const promises = Array.from({ length: 50 }, () => 
        withStability(operation, { timeout: 1000 })
      );
      
      await Promise.all(promises);
      
      // Should not have any hanging timeouts
      const status = stabilityMonitor.getStabilityStatus();
      expect(status.isStable).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary failures', async () => {
      let callCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('Recovered');
      });
      
      const result = await withStability(operation, { retries: 3 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Recovered');
      expect(result.retries).toBe(2);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      
      const operation = jest.fn().mockRejectedValue(networkError);
      
      const result = await withStability(operation, { retries: 2 });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network Error');
    });
  });
});
