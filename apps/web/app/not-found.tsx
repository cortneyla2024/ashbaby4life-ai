import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              Go to Homepage
            </Button>
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Or try one of these pages:</p>
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
              <Link href="/health" className="block text-blue-600 hover:underline">
                Health Tracking
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
