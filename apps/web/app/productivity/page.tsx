'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ProductivityPage() {
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
                Productivity
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
            Productivity Hub
          </h1>
          <p className="text-gray-600">
            Boost your efficiency with powerful productivity tools and task management.
          </p>
        </div>

        {/* Productivity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
            <p className="text-gray-600 text-sm">Currently in progress</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-gray-600 text-sm">This week</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">6.5 hrs</div>
            <h3 className="text-lg font-semibold mb-2">Focus Time</h3>
            <p className="text-gray-600 text-sm">Today's productive hours</p>
          </Card>
        </div>

        {/* Productivity Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Task Management</h3>
            <p className="text-gray-600 mb-4">
              Organize and track your tasks efficiently.
            </p>
            <Button variant="outline" className="w-full">
              Manage Tasks
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Calendar</h3>
            <p className="text-gray-600 mb-4">
              Schedule and manage your appointments.
            </p>
            <Button variant="outline" className="w-full">
              View Calendar
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
            <p className="text-gray-600 mb-4">
              Monitor your time and productivity.
            </p>
            <Button variant="outline" className="w-full">
              Track Time
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Goal Setting</h3>
            <p className="text-gray-600 mb-4">
              Set and achieve your personal goals.
            </p>
            <Button variant="outline" className="w-full">
              Set Goals
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Note Taking</h3>
            <p className="text-gray-600 mb-4">
              Capture and organize your thoughts.
            </p>
            <Button variant="outline" className="w-full">
              Take Notes
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Focus Mode</h3>
            <p className="text-gray-600 mb-4">
              Eliminate distractions and stay focused.
            </p>
            <Button variant="outline" className="w-full">
              Start Focus
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
