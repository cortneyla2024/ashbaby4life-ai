'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface GovernanceRule {
  id: string;
  title: string;
  category: 'privacy' | 'ethics' | 'inclusion' | 'security';
  status: 'active' | 'pending' | 'review';
  description: string;
}

interface SocialHub {
  id: string;
  name: string;
  type: 'community' | 'support' | 'learning' | 'advocacy';
  members: number;
  status: 'active' | 'moderated' | 'private';
  privacyLevel: 'public' | 'members-only' | 'invite-only';
}

interface FinancialGovernance {
  id: string;
  policy: string;
  category: 'budget' | 'investment' | 'transparency' | 'compliance';
  status: 'implemented' | 'proposed' | 'review';
}

export default function GovernancePage() {
  const [governanceRules] = useState<GovernanceRule[]>([
    {
      id: '1',
      title: 'Data Privacy Protection',
      category: 'privacy',
      status: 'active',
      description: 'Ensures user data is protected and handled ethically'
    },
    {
      id: '2',
      title: 'Inclusive Design Standards',
      category: 'inclusion',
      status: 'active',
      description: 'Platform accessibility for all users regardless of ability'
    },
    {
      id: '3',
      title: 'Ethical AI Guidelines',
      category: 'ethics',
      status: 'active',
      description: 'AI systems must operate with transparency and fairness'
    },
    {
      id: '4',
      title: 'Financial Transparency',
      category: 'security',
      status: 'active',
      description: 'Clear reporting and accountability for financial operations'
    }
  ]);

  const [socialHubs] = useState<SocialHub[]>([
    {
      id: '1',
      name: 'Community Support Network',
      type: 'support',
      members: 1250,
      status: 'active',
      privacyLevel: 'members-only'
    },
    {
      id: '2',
      name: 'Financial Wellness Group',
      type: 'learning',
      members: 890,
      status: 'moderated',
      privacyLevel: 'public'
    },
    {
      id: '3',
      name: 'Inclusive Technology Advocates',
      type: 'advocacy',
      members: 456,
      status: 'active',
      privacyLevel: 'invite-only'
    }
  ]);

  const [financialGovernance] = useState<FinancialGovernance[]>([
    {
      id: '1',
      policy: 'Budget Transparency',
      category: 'transparency',
      status: 'implemented'
    },
    {
      id: '2',
      policy: 'Ethical Investment Guidelines',
      category: 'investment',
      status: 'implemented'
    },
    {
      id: '3',
      policy: 'Financial Compliance Framework',
      category: 'compliance',
      status: 'implemented'
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
                Governance Hub
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
            Governance Hub
          </h1>
          <p className="text-gray-600">
            Privacy-first, ethical, and inclusive governance for finance and social communities.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Ethics</TabsTrigger>
            <TabsTrigger value="social">Social Hubs</TabsTrigger>
            <TabsTrigger value="finance">Financial Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🛡️</div>
                  <h3 className="text-lg font-semibold mb-2">Privacy Protection</h3>
                  <p className="text-2xl font-bold text-blue-600">100%</p>
                  <p className="text-sm text-gray-600">Data protection active</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🤝</div>
                  <h3 className="text-lg font-semibold mb-2">Inclusive Design</h3>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-600">Accessibility compliant</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <h3 className="text-lg font-semibold mb-2">Ethical AI</h3>
                  <p className="text-2xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-600">AI ethics enforced</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="text-lg font-semibold mb-2">Financial Transparency</h3>
                  <p className="text-2xl font-bold text-orange-600">100%</p>
                  <p className="text-sm text-gray-600">Transparent operations</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Governance Principles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <p className="font-medium">Privacy-First Design</p>
                      <p className="text-sm text-gray-600">User data protection at the core</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <p className="font-medium">Ethical AI</p>
                      <p className="text-sm text-gray-600">Transparent and fair AI systems</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🌍</div>
                    <div>
                      <p className="font-medium">Inclusive Communities</p>
                      <p className="text-sm text-gray-600">Accessible to all users</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="font-medium">Financial Transparency</p>
                      <p className="text-sm text-gray-600">Clear and accountable operations</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Privacy & Ethical Governance</h2>
              <div className="space-y-4">
                {governanceRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{rule.title}</h3>
                          <Badge variant={rule.category === 'privacy' ? 'default' : 'secondary'}>
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{rule.description}</p>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'default' : 'outline'}>
                        {rule.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Social Hubs & Communities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialHubs.map((hub) => (
                  <div key={hub.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl">
                        {hub.type === 'community' && '👥'}
                        {hub.type === 'support' && '🤝'}
                        {hub.type === 'learning' && '📚'}
                        {hub.type === 'advocacy' && '📢'}
                      </div>
                      <Badge variant={hub.status === 'active' ? 'default' : 'secondary'}>
                        {hub.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{hub.name}</h3>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Badge variant="outline">{hub.type}</Badge>
                        <Badge variant="outline">{hub.privacyLevel}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{hub.members} members</p>
                      <Button className="w-full" variant="outline">
                        Join Community
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Financial Governance</h2>
              <div className="space-y-4">
                {financialGovernance.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{policy.policy}</h3>
                        <p className="text-sm text-gray-600">Category: {policy.category}</p>
                      </div>
                      <Badge variant={policy.status === 'implemented' ? 'default' : 'secondary'}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Financial Transparency Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                    <p className="text-sm font-semibold">Budget Transparency</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="text-2xl font-bold text-blue-600 mb-1">100%</div>
                    <p className="text-sm font-semibold">Ethical Investments</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
                    <p className="text-sm font-semibold">Compliance Status</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
