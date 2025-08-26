'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function NewsAlertsPage() {
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
                News & Alerts
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
            News & Alerts
          </h1>
          <p className="text-gray-600">
            Stay informed with personalized news, alerts, and real-time updates.
          </p>
        </div>

        {/* News Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">24</div>
            <h3 className="text-lg font-semibold mb-2">New Articles</h3>
            <p className="text-gray-600 text-sm">Today's updates</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">8</div>
            <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
            <p className="text-gray-600 text-sm">Important notifications</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Saved Articles</h3>
            <p className="text-gray-600 text-sm">Your bookmarks</p>
          </Card>
        </div>

        {/* News Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📰</div>
            <h3 className="text-lg font-semibold mb-2">Latest News</h3>
            <p className="text-gray-600 mb-4">
              Get the latest news from trusted sources.
            </p>
            <Button variant="outline" className="w-full">
              Read News
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
            <p className="text-gray-600 mb-4">
              Receive personalized alerts and notifications.
            </p>
            <Button variant="outline" className="w-full">
              Manage Alerts
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Personalized Feed</h3>
            <p className="text-gray-600 mb-4">
              News tailored to your interests.
            </p>
            <Button variant="outline" className="w-full">
              View Feed
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Trending Topics</h3>
            <p className="text-gray-600 mb-4">
              Discover what's trending now.
            </p>
            <Button variant="outline" className="w-full">
              View Trends
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Search News</h3>
            <p className="text-gray-600 mb-4">
              Search for specific topics and articles.
            </p>
            <Button variant="outline" className="w-full">
              Search
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
            <p className="text-gray-600 mb-4">
              Get instant updates on your device.
            </p>
            <Button variant="outline" className="w-full">
              Configure
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
