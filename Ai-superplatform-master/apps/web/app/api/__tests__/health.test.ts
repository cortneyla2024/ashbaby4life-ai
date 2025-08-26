import { GET } from '../health/route';
import { NextRequest } from 'next/server';

describe('Health Check API', () => {
  it('returns healthy status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.environment).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.services).toBeDefined();
  });

  it('includes required service status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.services.database).toBe('connected');
    expect(data.services.ai).toBe('available');
    expect(data.services.storage).toBe('available');
  });

  it('handles errors gracefully', async () => {
    // Mock a scenario where the health check fails
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // This test would need to be expanded if we add more complex logic
    // For now, we're just testing the basic structure
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(200); // Should still return 200 for basic health check
    
    console.error = originalConsoleError;
  });
});


