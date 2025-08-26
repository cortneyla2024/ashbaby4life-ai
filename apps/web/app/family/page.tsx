'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function FamilyPage() {
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
                Family Admin
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
            Family Admin
          </h1>
          <p className="text-gray-600">
            Manage family connections, permissions, and shared resources.
          </p>
        </div>

        {/* Family Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
            <h3 className="text-lg font-semibold mb-2">Family Members</h3>
            <p className="text-gray-600 text-sm">Connected accounts</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">3</div>
            <h3 className="text-lg font-semibold mb-2">Shared Resources</h3>
            <p className="text-gray-600 text-sm">Calendars, budgets, etc.</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Active Permissions</h3>
            <p className="text-gray-600 text-sm">Across all members</p>
          </Card>
        </div>

        {/* Family Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-semibold mb-2">Member Management</h3>
            <p className="text-gray-600 mb-4">
              Add, remove, and manage family member accounts.
            </p>
            <Button variant="outline" className="w-full">
              Manage Members
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Permission Settings</h3>
            <p className="text-gray-600 mb-4">
              Control access to shared resources and features.
            </p>
            <Button variant="outline" className="w-full">
              Set Permissions
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Shared Calendar</h3>
            <p className="text-gray-600 mb-4">
              Coordinate family events and schedules.
            </p>
            <Button variant="outline" className="w-full">
              View Calendar
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Family Budget</h3>
            <p className="text-gray-600 mb-4">
              Manage shared family finances and expenses.
            </p>
            <Button variant="outline" className="w-full">
              Manage Budget
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Family Chat</h3>
            <p className="text-gray-600 mb-4">
              Communicate with family members securely.
            </p>
            <Button variant="outline" className="w-full">
              Open Chat
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Family Analytics</h3>
            <p className="text-gray-600 mb-4">
              View family activity and usage statistics.
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
