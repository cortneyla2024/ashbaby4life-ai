'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SocialHubPage() {
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
                Social Hub
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
            Social Hub
          </h1>
          <p className="text-gray-600">
            Connect with your community, share experiences, and build meaningful relationships.
          </p>
        </div>

        {/* Social Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">156</div>
            <h3 className="text-lg font-semibold mb-2">Community Members</h3>
            <p className="text-gray-600 text-sm">Active connections</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">24</div>
            <h3 className="text-lg font-semibold mb-2">Groups</h3>
            <p className="text-gray-600 text-sm">Communities you're part of</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">89</div>
            <h3 className="text-lg font-semibold mb-2">Recent Posts</h3>
            <p className="text-gray-600 text-sm">From your network</p>
          </Card>
        </div>

        {/* Social Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Community Groups</h3>
            <p className="text-gray-600 mb-4">
              Join and participate in community groups.
            </p>
            <Button variant="outline" className="w-full">
              Browse Groups
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Messaging</h3>
            <p className="text-gray-600 mb-4">
              Connect with friends and family through messaging.
            </p>
            <Button variant="outline" className="w-full">
              Open Messages
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Social Feed</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with your social network.
            </p>
            <Button variant="outline" className="w-full">
              View Feed
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Events</h3>
            <p className="text-gray-600 mb-4">
              Discover and join community events.
            </p>
            <Button variant="outline" className="w-full">
              Browse Events
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Networking</h3>
            <p className="text-gray-600 mb-4">
              Build professional and personal connections.
            </p>
            <Button variant="outline" className="w-full">
              Network
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Social Analytics</h3>
            <p className="text-gray-600 mb-4">
              Track your social engagement and connections.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
