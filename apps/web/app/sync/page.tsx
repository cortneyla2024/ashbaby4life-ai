'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SyncPage() {
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
                Data Sync
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
            Data Sync & Sovereignty
          </h1>
          <p className="text-gray-600">
            Synchronize your data across devices and maintain data sovereignty.
          </p>
        </div>

        {/* Sync Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <h3 className="text-lg font-semibold mb-2">Connected Devices</h3>
            <p className="text-gray-600 text-sm">Syncing data</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">2.5 GB</div>
            <h3 className="text-lg font-semibold mb-2">Data Synced</h3>
            <p className="text-gray-600 text-sm">Total synchronized</p>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">100%</div>
            <h3 className="text-lg font-semibold mb-2">Sync Status</h3>
            <p className="text-gray-600 text-sm">All devices up to date</p>
          </Card>
        </div>

        {/* Sync Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Auto Sync</h3>
            <p className="text-gray-600 mb-4">
              Automatically sync data across all devices.
            </p>
            <Button variant="outline" className="w-full">
              Configure Sync
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Data Sovereignty</h3>
            <p className="text-gray-600 mb-4">
              Maintain control over your personal data.
            </p>
            <Button variant="outline" className="w-full">
              Manage Data
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Device Management</h3>
            <p className="text-gray-600 mb-4">
              Manage your connected devices.
            </p>
            <Button variant="outline" className="w-full">
              Manage Devices
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">💾</div>
            <h3 className="text-lg font-semibold mb-2">Backup</h3>
            <p className="text-gray-600 mb-4">
              Create secure backups of your data.
            </p>
            <Button variant="outline" className="w-full">
              Create Backup
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Sync History</h3>
            <p className="text-gray-600 mb-4">
              View your sync history and logs.
            </p>
            <Button variant="outline" className="w-full">
              View History
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">
              Configure sync preferences and options.
            </p>
            <Button variant="outline" className="w-full">
              Settings
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
