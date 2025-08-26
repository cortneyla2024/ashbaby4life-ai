'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LearningPage() {
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
                Learning Platform
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
            Learning Platform
          </h1>
          <p className="text-gray-600">
            Expand your knowledge with our AI-powered learning tools and knowledge graph.
          </p>
        </div>

        {/* Learning Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
            <h3 className="text-lg font-semibold mb-2">Active Courses</h3>
            <p className="text-gray-600 text-sm">Currently enrolled</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-gray-600 text-sm">Average across courses</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">156</div>
            <h3 className="text-lg font-semibold mb-2">Knowledge Nodes</h3>
            <p className="text-gray-600 text-sm">In your knowledge graph</p>
          </Card>
        </div>

        {/* Learning Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Knowledge Graph</h3>
            <p className="text-gray-600 mb-4">
              Visualize and connect your knowledge with AI-powered insights.
            </p>
            <Button variant="outline" className="w-full">
              Explore Graph
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Course Library</h3>
            <p className="text-gray-600 mb-4">
              Access a vast library of courses and educational content.
            </p>
            <Button variant="outline" className="w-full">
              Browse Courses
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Learning Goals</h3>
            <p className="text-gray-600 mb-4">
              Set and track your learning objectives and progress.
            </p>
            <Button variant="outline" className="w-full">
              Manage Goals
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI Tutor</h3>
            <p className="text-gray-600 mb-4">
              Get personalized learning assistance from AI.
            </p>
            <Button variant="outline" className="w-full">
              Start Learning
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
            <p className="text-gray-600 mb-4">
              Track your learning progress and performance.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">Achievements</h3>
            <p className="text-gray-600 mb-4">
              Earn badges and certificates for your accomplishments.
            </p>
            <Button variant="outline" className="w-full">
              View Achievements
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
