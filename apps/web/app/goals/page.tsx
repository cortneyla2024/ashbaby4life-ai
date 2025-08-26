'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GoalsPage() {
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
                Goals & Badges
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
            Goals & Badges
          </h1>
          <p className="text-gray-600">
            Set goals, track progress, and earn badges for your achievements.
          </p>
        </div>

        {/* Goals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">8</div>
            <h3 className="text-lg font-semibold mb-2">Active Goals</h3>
            <p className="text-gray-600 text-sm">Currently tracking</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Completed Goals</h3>
            <p className="text-gray-600 text-sm">Achieved this year</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">24</div>
            <h3 className="text-lg font-semibold mb-2">Badges Earned</h3>
            <p className="text-gray-600 text-sm">Total achievements</p>
          </Card>
        </div>

        {/* Goals Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Set Goals</h3>
            <p className="text-gray-600 mb-4">
              Create new personal and professional goals.
            </p>
            <Button variant="outline" className="w-full">
              Create Goal
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600 mb-4">
              Monitor your progress towards your goals.
            </p>
            <Button variant="outline" className="w-full">
              View Progress
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Badges</h3>
            <p className="text-gray-600 mb-4">
              View and earn achievement badges.
            </p>
            <Button variant="outline" className="w-full">
              View Badges
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">
              Analyze your goal completion patterns.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Share Goals</h3>
            <p className="text-gray-600 mb-4">
              Share your goals with friends and family.
            </p>
            <Button variant="outline" className="w-full">
              Share
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Celebrate</h3>
            <p className="text-gray-600 mb-4">
              Celebrate your achievements and milestones.
            </p>
            <Button variant="outline" className="w-full">
              Celebrate
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
