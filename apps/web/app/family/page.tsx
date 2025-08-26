'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guardian' | 'admin';
  age: number;
  avatar: string;
  status: 'active' | 'inactive';
}

export default function FamilyPage() {
  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'parent',
      age: 35,
      avatar: '👨',
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Smith',
      role: 'parent',
      age: 32,
      avatar: '👩',
      status: 'active'
    },
    {
      id: '3',
      name: 'Emma Smith',
      role: 'child',
      age: 12,
      avatar: '👧',
      status: 'active'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                CareConnect v5.0
              </Link>
              <Badge variant="secondary" className="ml-3">
                Family Hub
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family Hub
          </h1>
          <p className="text-gray-600">
            Multi-admin family management with child protection and AI-guided communication.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Family Members</TabsTrigger>
            <TabsTrigger value="protection">Child Protection</TabsTrigger>
            <TabsTrigger value="communication">AI Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                  <h3 className="text-lg font-semibold mb-2">Family Members</h3>
                  <p className="text-2xl font-bold text-blue-600">{familyMembers.length}</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h3 className="text-lg font-semibold mb-2">Protection Active</h3>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <h3 className="text-lg font-semibold mb-2">AI Guidance</h3>
                  <p className="text-2xl font-bold text-purple-600">Ready</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Family Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{member.avatar}</div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role} • Age {member.age}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="protection" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Child Protection & Safety</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-2">Screen Time Limits</h3>
                  <p className="text-gray-600">Maximum 2 hours of screen time per day for children</p>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-2">Content Filtering</h3>
                  <p className="text-gray-600">Block inappropriate content and monitor online activity</p>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-2">Location Sharing</h3>
                  <p className="text-gray-600">Enable location sharing for safety monitoring</p>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI-Guided Family Communication</h2>
              <div className="space-y-4">
                <Button className="w-full">Schedule Family Meeting</Button>
                <Button variant="outline" className="w-full">Get Communication Guidance</Button>
                <Button variant="outline" className="w-full">Start AI Chat Session</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
