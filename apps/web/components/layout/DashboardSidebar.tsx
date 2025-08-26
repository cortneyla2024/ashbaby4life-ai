'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Home,
  MessageCircle,
  Video,
  Heart,
  DollarSign,
  BookOpen,
  Palette,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  description?: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    href: '/dashboard',
    description: 'Main dashboard and insights'
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: MessageCircle,
    href: '/dashboard?tab=ai-chat',
    description: 'Chat with AI assistant'
  },
  {
    id: 'video-call',
    label: 'Video Call',
    icon: Video,
    href: '/dashboard?tab=video-call',
    description: 'Face-to-face AI interaction'
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    icon: Heart,
    href: '/dashboard?tab=mental-health',
    description: 'Mood tracking and wellness'
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    href: '/dashboard?tab=finance',
    description: 'Budget and expense tracking'
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: BookOpen,
    href: '/dashboard?tab=learning',
    description: 'Skills and knowledge tracking'
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: Palette,
    href: '/dashboard?tab=creative',
    description: 'Art and creative expression'
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    href: '/dashboard?tab=social',
    description: 'Community and connections'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/dashboard?tab=settings',
    description: 'Account and preferences'
  }
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('overview');

  const handleNavClick = (item: NavItem) => {
    setActiveItem(item.id);
    router.push(item.href);
  };

  return (
    <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isCollapsed ? item.description : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                AI Assistant
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                Your benevolent AI companion is here to help you thrive.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
