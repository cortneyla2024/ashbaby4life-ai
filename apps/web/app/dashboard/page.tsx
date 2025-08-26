'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
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
                Dashboard
              </Badge>
            </div>
            <div className="flex space-x-4">
              <Link href="/ai-assistant">
                <Button>AI Assistant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            Access all your platform features and manage your digital life.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Get AI-powered help and insights
            </p>
            <Link href="/ai-assistant">
              <Button className="w-full">Open AI Assistant</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Finance Hub</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Manage budgets and transactions
            </p>
            <Link href="/finance">
              <Button className="w-full">Manage Finance</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🏥</div>
            <h3 className="text-lg font-semibold mb-2">Health Tracking</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Monitor health and wellness
            </p>
            <Link href="/health">
              <Button className="w-full">Track Health</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Learning</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Knowledge graph and learning tools
            </p>
            <Link href="/learning">
              <Button className="w-full">Start Learning</Button>
            </Link>
          </Card>
        </div>

        {/* Platform Status */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Platform Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">All Systems Operational</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Performance Optimized</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Error Prevention Active</span>
            </div>
          </div>
        </Card>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Family Admin */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-semibold mb-2">Family Admin</h3>
            <p className="text-gray-600 mb-4">
              Manage family connections, permissions, and shared resources.
            </p>
            <Link href="/family">
              <Button variant="outline" className="w-full">
                Family Management
              </Button>
            </Link>
          </Card>

          {/* Marketplace */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">Marketplace</h3>
            <p className="text-gray-600 mb-4">
              Discover and install plugins to extend your platform capabilities.
            </p>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">
                Browse Marketplace
              </Button>
            </Link>
          </Card>

          {/* Sync Data */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Data Sync</h3>
            <p className="text-gray-600 mb-4">
              Synchronize your data across devices and manage data sovereignty.
            </p>
            <Link href="/sync">
              <Button variant="outline" className="w-full">
                Manage Sync
              </Button>
            </Link>
          </Card>

          {/* News Hub */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📰</div>
            <h3 className="text-lg font-semibold mb-2">News Hub</h3>
            <p className="text-gray-600 mb-4">
              Stay informed with personalized news and AI-powered summaries.
            </p>
            <Link href="/news">
              <Button variant="outline" className="w-full">
                Read News
              </Button>
            </Link>
          </Card>

          {/* Productivity */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Productivity</h3>
            <p className="text-gray-600 mb-4">
              Notebooks, tasks, and productivity tools for maximum efficiency.
            </p>
            <Link href="/productivity">
              <Button variant="outline" className="w-full">
                Boost Productivity
              </Button>
            </Link>
          </Card>

          {/* Goals & Badges */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Goals & Badges</h3>
            <p className="text-gray-600 mb-4">
              Set goals, track progress, and earn badges for achievements.
            </p>
            <Link href="/goals">
              <Button variant="outline" className="w-full">
                View Goals
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
