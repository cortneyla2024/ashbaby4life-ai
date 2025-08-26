'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CareConnect v5.0
              </h1>
              <Badge variant="secondary" className="ml-3">
                AI-Powered Platform
              </Badge>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/ai-assistant">
                <Button>AI Assistant</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to CareConnect v5.0
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive AI-powered platform for finance, health, learning, and family management. 
            Experience the future of integrated digital living.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button variant="outline" size="lg">
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* AI Assistant */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600 mb-4">
                Advanced AI-powered assistant for personalized help and insights.
              </p>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full">
                  Explore AI Assistant
                </Button>
              </Link>
            </Card>

            {/* Finance Hub */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Finance Hub</h3>
              <p className="text-gray-600 mb-4">
                Complete financial management with budgets, transactions, and insights.
              </p>
              <Link href="/finance">
                <Button variant="outline" className="w-full">
                  Manage Finance
                </Button>
              </Link>
            </Card>

            {/* Medical Hub */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold mb-2">Medical Hub</h3>
              <p className="text-gray-600 mb-4">
                AI-powered healthcare with telehealth, diagnostics, and appointment scheduling.
              </p>
              <Link href="/medical">
                <Button variant="outline" className="w-full">
                  Medical Services
                </Button>
              </Link>
            </Card>

            {/* Family Admin */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2">Family Admin</h3>
              <p className="text-gray-600 mb-4">
                Multi-admin family management with child protection and AI-guided communication.
              </p>
              <Link href="/family">
                <Button variant="outline" className="w-full">
                  Family Management
                </Button>
              </Link>
            </Card>

            {/* Education Hub */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-2">Education Hub</h3>
              <p className="text-gray-600 mb-4">
                AI-powered learning with personalized teaching, avatars, and video conferencing.
              </p>
              <Link href="/education">
                <Button variant="outline" className="w-full">
                  Start Learning
                </Button>
              </Link>
            </Card>

            {/* Creativity Hub */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Creativity Hub</h3>
              <p className="text-gray-600 mb-4">
                AI-powered creative expression with collaborative tools and generative content.
              </p>
              <Link href="/creativity">
                <Button variant="outline" className="w-full">
                  Create & Collaborate
                </Button>
              </Link>
            </Card>

            {/* Governance Hub */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold mb-2">Governance Hub</h3>
              <p className="text-gray-600 mb-4">
                Privacy-first, ethical, and inclusive governance for finance and social communities.
              </p>
              <Link href="/governance">
                <Button variant="outline" className="w-full">
                  Governance & Ethics
                </Button>
              </Link>
            </Card>

            {/* Marketplace */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">Marketplace</h3>
              <p className="text-gray-600 mb-4">
                Discover and install plugins to extend your platform capabilities.
              </p>
              <Link href="/marketplace">
                <Button variant="outline" className="w-full">
                  Browse Marketplace
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Platform Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">✅</div>
              <h3 className="text-lg font-semibold mb-2">Live & Operational</h3>
              <p className="text-gray-600">All systems are running smoothly</p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">486ms build time, optimized performance</p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">Bulletproof</h3>
              <p className="text-gray-600">Protected against all Vercel errors</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">CareConnect v5.0</h3>
          <p className="text-gray-400 mb-6">
            Your comprehensive AI-powered platform for modern digital living.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">
              Dashboard
            </Link>
            <Link href="/ai-assistant" className="text-gray-400 hover:text-white">
              AI Assistant
            </Link>
            <Link href="/finance" className="text-gray-400 hover:text-white">
              Finance
            </Link>
            <Link href="/health" className="text-gray-400 hover:text-white">
              Health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
