'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                CareConnect v5.0
              </Link>
              <Badge variant="secondary" className="ml-3">
                Health Tracking
              </Badge>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Tracking
          </h1>
          <p className="text-gray-600">
            Monitor your health, track wellness, and maintain a healthy lifestyle.
          </p>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
            <h3 className="text-lg font-semibold mb-2">Overall Health Score</h3>
            <p className="text-gray-600 text-sm">Based on all metrics</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">7.5 hrs</div>
            <h3 className="text-lg font-semibold mb-2">Average Sleep</h3>
            <p className="text-gray-600 text-sm">Last 7 days</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">8,450</div>
            <h3 className="text-lg font-semibold mb-2">Daily Steps</h3>
            <p className="text-gray-600 text-sm">Goal: 10,000 steps</p>
          </Card>
        </div>

        {/* Health Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">😊</div>
            <h3 className="text-lg font-semibold mb-2">Mood Tracking</h3>
            <p className="text-gray-600 mb-4">
              Track your daily mood and emotional well-being.
            </p>
            <Button variant="outline" className="w-full">
              Track Mood
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💊</div>
            <h3 className="text-lg font-semibold mb-2">Medication Reminders</h3>
            <p className="text-gray-600 mb-4">
              Never miss your medications with smart reminders.
            </p>
            <Button variant="outline" className="w-full">
              Manage Medications
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🏃‍♂️</div>
            <h3 className="text-lg font-semibold mb-2">Activity Tracking</h3>
            <p className="text-gray-600 mb-4">
              Monitor your physical activity and exercise.
            </p>
            <Button variant="outline" className="w-full">
              Track Activity
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🍎</div>
            <h3 className="text-lg font-semibold mb-2">Nutrition</h3>
            <p className="text-gray-600 mb-4">
              Track your diet and nutritional intake.
            </p>
            <Button variant="outline" className="w-full">
              Track Nutrition
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💤</div>
            <h3 className="text-lg font-semibold mb-2">Sleep Analysis</h3>
            <p className="text-gray-600 mb-4">
              Monitor your sleep patterns and quality.
            </p>
            <Button variant="outline" className="w-full">
              View Sleep Data
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Health Reports</h3>
            <p className="text-gray-600 mb-4">
              Generate comprehensive health reports.
            </p>
            <Button variant="outline" className="w-full">
              View Reports
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
