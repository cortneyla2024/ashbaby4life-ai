'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function CommunityPage() {
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
                Community
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
            Community Hub
          </h1>
          <p className="text-gray-600">
            Connect with your local community and participate in meaningful activities.
          </p>
        </div>

        {/* Community Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">1,234</div>
            <h3 className="text-lg font-semibold mb-2">Community Members</h3>
            <p className="text-gray-600 text-sm">Active participants</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">45</div>
            <h3 className="text-lg font-semibold mb-2">Active Events</h3>
            <p className="text-gray-600 text-sm">This month</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">89</div>
            <h3 className="text-lg font-semibold mb-2">Community Groups</h3>
            <p className="text-gray-600 text-sm">Specialized communities</p>
          </Card>
        </div>

        {/* Community Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">Local Groups</h3>
            <p className="text-gray-600 mb-4">
              Join local community groups and organizations.
            </p>
            <Button variant="outline" className="w-full">
              Find Groups
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Community Events</h3>
            <p className="text-gray-600 mb-4">
              Discover and participate in local events.
            </p>
            <Button variant="outline" className="w-full">
              Browse Events
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Volunteer</h3>
            <p className="text-gray-600 mb-4">
              Find volunteer opportunities in your area.
            </p>
            <Button variant="outline" className="w-full">
              Volunteer
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Community Chat</h3>
            <p className="text-gray-600 mb-4">
              Connect with neighbors and community members.
            </p>
            <Button variant="outline" className="w-full">
              Join Chat
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📢</div>
            <h3 className="text-lg font-semibold mb-2">Announcements</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with community announcements.
            </p>
            <Button variant="outline" className="w-full">
              View Updates
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🏘️</div>
            <h3 className="text-lg font-semibold mb-2">Neighborhood</h3>
            <p className="text-gray-600 mb-4">
              Connect with your immediate neighborhood.
            </p>
            <Button variant="outline" className="w-full">
              Neighborhood
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
