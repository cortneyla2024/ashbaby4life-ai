'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function FinancePage() {
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
                Finance Hub
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
            Finance Hub
          </h1>
          <p className="text-gray-600">
            Manage your finances, track budgets, and monitor transactions.
          </p>
        </div>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">$12,450</div>
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-gray-600 text-sm">Across all accounts</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">$3,200</div>
            <h3 className="text-lg font-semibold mb-2">Monthly Budget</h3>
            <p className="text-gray-600 text-sm">$2,800 spent this month</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">$850</div>
            <h3 className="text-lg font-semibold mb-2">Savings Goal</h3>
            <p className="text-gray-600 text-sm">$650 saved this month</p>
          </Card>
        </div>

        {/* Finance Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Budget Management</h3>
            <p className="text-gray-600 mb-4">
              Create and track budgets for different categories.
            </p>
            <Button variant="outline" className="w-full">
              Manage Budgets
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Transaction Tracking</h3>
            <p className="text-gray-600 mb-4">
              Monitor all your income and expenses.
            </p>
            <Button variant="outline" className="w-full">
              View Transactions
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Financial Analytics</h3>
            <p className="text-gray-600 mb-4">
              Get insights into your spending patterns.
            </p>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Savings Goals</h3>
            <p className="text-gray-600 mb-4">
              Set and track your financial goals.
            </p>
            <Button variant="outline" className="w-full">
              Manage Goals
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💳</div>
            <h3 className="text-lg font-semibold mb-2">Account Management</h3>
            <p className="text-gray-600 mb-4">
              Manage your bank accounts and cards.
            </p>
            <Button variant="outline" className="w-full">
              Manage Accounts
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <p className="text-gray-600 mb-4">
              Secure your financial data and transactions.
            </p>
            <Button variant="outline" className="w-full">
              Security Settings
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
