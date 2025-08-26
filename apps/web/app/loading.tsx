import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading CareConnect v5.0
        </h2>
        <p className="text-gray-600">
          Please wait while we prepare your experience...
        </p>
      </div>
    </div>
  );
}
