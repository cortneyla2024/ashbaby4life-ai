'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  label: string;
  type: 'toggle' | 'input' | 'select' | 'button' | 'info';
  value?: any;
  options?: string[];
  description?: string;
  action?: () => void;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      aiInsights: true,
      communityUpdates: true,
      financialAlerts: true,
      healthReminders: true,
      learningProgress: true,
    },
    privacy: {
      profileVisibility: 'friends',
      dataSharing: false,
      locationSharing: false,
      analyticsSharing: true,
      aiDataUsage: true,
    },
    appearance: {
      theme: 'system',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
    },
    security: {
      twoFactorAuth: false,
      biometricAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
    ai: {
      personality: 'helpful',
      responseLength: 'detailed',
      autoSuggestions: true,
      voiceEnabled: true,
      videoEnabled: true,
    },
  });

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: '👤',
      items: [
        {
          id: 'displayName',
          label: 'Display Name',
          type: 'input',
          value: 'John Doe',
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'input',
          value: 'john.doe@example.com',
        },
        {
          id: 'timezone',
          label: 'Time Zone',
          type: 'select',
          value: 'UTC-5',
          options: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+5:30'],
        },
        {
          id: 'language',
          label: 'Language',
          type: 'select',
          value: 'English',
          options: ['English', 'Spanish', 'French', 'German', 'Chinese'],
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how you receive updates and alerts',
      icon: '🔔',
      items: [
        {
          id: 'email',
          label: 'Email Notifications',
          type: 'toggle',
          value: settings.notifications.email,
          description: 'Receive updates via email',
        },
        {
          id: 'push',
          label: 'Push Notifications',
          type: 'toggle',
          value: settings.notifications.push,
          description: 'Receive push notifications on device',
        },
        {
          id: 'aiInsights',
          label: 'AI Insights',
          type: 'toggle',
          value: settings.notifications.aiInsights,
          description: 'Get AI-powered recommendations',
        },
        {
          id: 'financialAlerts',
          label: 'Financial Alerts',
          type: 'toggle',
          value: settings.notifications.financialAlerts,
          description: 'Important financial notifications',
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Control your data and account security',
      icon: '🔒',
      items: [
        {
          id: 'profileVisibility',
          label: 'Profile Visibility',
          type: 'select',
          value: settings.privacy.profileVisibility,
          options: ['public', 'friends', 'private'],
          description: 'Who can see your profile',
        },
        {
          id: 'dataSharing',
          label: 'Data Sharing',
          type: 'toggle',
          value: settings.privacy.dataSharing,
          description: 'Share data for platform improvement',
        },
        {
          id: 'twoFactorAuth',
          label: 'Two-Factor Authentication',
          type: 'toggle',
          value: settings.security.twoFactorAuth,
          description: 'Add extra security to your account',
        },
        {
          id: 'biometricAuth',
          label: 'Biometric Authentication',
          type: 'toggle',
          value: settings.security.biometricAuth,
          description: 'Use fingerprint or face ID',
        },
      ],
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the platform',
      icon: '🎨',
      items: [
        {
          id: 'theme',
          label: 'Theme',
          type: 'select',
          value: settings.appearance.theme,
          options: ['light', 'dark', 'system'],
          description: 'Choose your preferred theme',
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          type: 'select',
          value: settings.appearance.fontSize,
          options: ['small', 'medium', 'large'],
          description: 'Adjust text size for better readability',
        },
        {
          id: 'animations',
          label: 'Animations',
          type: 'toggle',
          value: settings.appearance.animations,
          description: 'Enable smooth animations',
        },
      ],
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      description: 'Configure your AI assistant preferences',
      icon: '🤖',
      items: [
        {
          id: 'personality',
          label: 'AI Personality',
          type: 'select',
          value: settings.ai.personality,
          options: ['helpful', 'professional', 'casual', 'creative'],
          description: 'Choose how your AI assistant behaves',
        },
        {
          id: 'voiceEnabled',
          label: 'Voice Interaction',
          type: 'toggle',
          value: settings.ai.voiceEnabled,
          description: 'Enable voice commands and responses',
        },
        {
          id: 'videoEnabled',
          label: 'Video Avatar',
          type: 'toggle',
          value: settings.ai.videoEnabled,
          description: 'Show AI avatar during video calls',
        },
        {
          id: 'autoSuggestions',
          label: 'Auto Suggestions',
          type: 'toggle',
          value: settings.ai.autoSuggestions,
          description: 'Get AI-powered suggestions',
        },
      ],
    },
    {
      id: 'system',
      title: 'System',
      description: 'Platform and performance settings',
      icon: '⚙️',
      items: [
        {
          id: 'storage',
          label: 'Storage Usage',
          type: 'info',
          value: '2.3 GB / 10 GB',
          description: 'Local data storage',
        },
        {
          id: 'syncStatus',
          label: 'Sync Status',
          type: 'info',
          value: 'Up to date',
          description: 'Last synced 2 minutes ago',
        },
        {
          id: 'clearCache',
          label: 'Clear Cache',
          type: 'button',
          description: 'Free up storage space',
          action: () => console.log('Clear cache'),
        },
        {
          id: 'exportData',
          label: 'Export Data',
          type: 'button',
          description: 'Download your data',
          action: () => console.log('Export data'),
        },
      ],
    },
  ];

  const handleSettingChange = (sectionId: string, itemId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof prev],
        [itemId]: value,
      },
    }));
  };

  const renderSettingItem = (item: SettingsItem, sectionId: string) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <Button
              variant={item.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSettingChange(sectionId, item.id, !item.value)}
            >
              {item.value ? 'On' : 'Off'}
            </Button>
          </div>
        );

      case 'input':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">{item.label}</label>
            <Input
              value={item.value}
              onChange={(e) => handleSettingChange(sectionId, item.id, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">{item.label}</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={item.value}
              onChange={(e) => handleSettingChange(sectionId, item.id, e.target.value)}
            >
              {item.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={item.action}>
              {item.label}
            </Button>
          </div>
        );

      case 'info':
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <Badge variant="secondary">{item.value}</Badge>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="py-2 border-b border-gray-100 last:border-b-0">
                  {renderSettingItem(item, section.id)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold">2.3 GB</p>
              </div>
              <Progress value={23} className="w-16" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Active Sessions</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Last Backup</p>
              <p className="text-2xl font-bold">2h ago</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500">Sync Status</p>
              <Badge variant="default" className="mt-1">Up to date</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
