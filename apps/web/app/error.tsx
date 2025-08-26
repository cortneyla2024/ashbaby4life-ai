'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-red-600 mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>If the problem persists, try:</p>
            <div className="mt-2 space-y-1">
              <Link href="/dashboard" className="block text-blue-600 hover:underline">
                Dashboard
              </Link>
              <Link href="/ai-assistant" className="block text-blue-600 hover:underline">
                AI Assistant
              </Link>
              <Link href="/finance" className="block text-blue-600 hover:underline">
                Finance Hub
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
