'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function MarketplacePage() {
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
                Marketplace
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
            Plugin Marketplace
          </h1>
          <p className="text-gray-600">
            Discover and install plugins to extend your platform capabilities.
          </p>
        </div>

        {/* Marketplace Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">156</div>
            <h3 className="text-lg font-semibold mb-2">Available Plugins</h3>
            <p className="text-gray-600 text-sm">Ready to install</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Installed Plugins</h3>
            <p className="text-gray-600 text-sm">Currently active</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">4.8★</div>
            <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
            <p className="text-gray-600 text-sm">Community feedback</p>
          </Card>
        </div>

        {/* Featured Plugins */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Enhanced analytics and reporting capabilities.
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">Free</Badge>
                <Button size="sm">Install</Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Security Suite</h3>
              <p className="text-gray-600 mb-4">
                Advanced security and privacy features.
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">Premium</Badge>
                <Button size="sm">Install</Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Theme Customizer</h3>
              <p className="text-gray-600 mb-4">
                Customize your platform appearance.
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">Free</Badge>
                <Button size="sm">Install</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Plugin Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI & Automation</h3>
            <p className="text-gray-600 mb-4">
              AI-powered plugins and automation tools.
            </p>
            <Button variant="outline" className="w-full">
              Browse AI Plugins
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Communication</h3>
            <p className="text-gray-600 mb-4">
              Messaging, video calls, and communication tools.
            </p>
            <Button variant="outline" className="w-full">
              Browse Communication
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Productivity</h3>
            <p className="text-gray-600 mb-4">
              Tools to boost your productivity and efficiency.
            </p>
            <Button variant="outline" className="w-full">
              Browse Productivity
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎮</div>
            <h3 className="text-lg font-semibold mb-2">Entertainment</h3>
            <p className="text-gray-600 mb-4">
              Games, media, and entertainment plugins.
            </p>
            <Button variant="outline" className="w-full">
              Browse Entertainment
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔧</div>
            <h3 className="text-lg font-semibold mb-2">Utilities</h3>
            <p className="text-gray-600 mb-4">
              Essential utilities and helper tools.
            </p>
            <Button variant="outline" className="w-full">
              Browse Utilities
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Specialized</h3>
            <p className="text-gray-600 mb-4">
              Specialized plugins for specific needs.
            </p>
            <Button variant="outline" className="w-full">
              Browse Specialized
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
