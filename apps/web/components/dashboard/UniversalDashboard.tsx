'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  Grid, 
  Settings, 
  Bell, 
  User, 
  Plus,
  X,
  Maximize2,
  Minimize2,
  Move,
  Trash2
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/hooks/useSearch';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useWidgets } from '@/hooks/useWidgets';
import { useNotifications } from '@/hooks/useNotifications';
import { Widget, WidgetType, WidgetConfig } from '@/types/widgets';
import { SearchWidget } from './widgets/SearchWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { CommunityWidget } from './widgets/CommunityWidget';
import { MarketplaceWidget } from './widgets/MarketplaceWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { CommandPalette } from './CommandPalette';
import { QuickLaunch } from './QuickLaunch';
import { WidgetSettings } from './WidgetSettings';

interface UniversalDashboardProps {
  className?: string;
}

export const UniversalDashboard: React.FC<UniversalDashboardProps> = ({ 
  className 
}) => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const { isOpen: isCommandOpen, open: openCommand, close: closeCommand } = useCommandPalette();
  const { widgets, addWidget, removeWidget, updateWidget, reorderWidgets } = useWidgets();
  const { notifications, markAsRead } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState(false);
  const [isWidgetSettingsOpen, setIsWidgetSettingsOpen] = useState(false);

  // Hotkeys
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    openCommand();
  });

  useHotkeys('cmd+shift+k, ctrl+shift+k', (e) => {
    e.preventDefault();
    setIsEditing(!isEditing);
  });

  useHotkeys('escape', () => {
    closeCommand();
    setIsEditing(false);
    setSelectedWidget(null);
  });

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      await performSearch(query);
    }
  }, [performSearch]);

  // Handle widget actions
  const handleAddWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      config: getDefaultWidgetConfig(type),
      isMinimized: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addWidget(newWidget);
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId);
    setSelectedWidget(null);
  };

  const handleToggleMinimize = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isMinimized: !widget.isMinimized });
    }
  };

  const handleTogglePin = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isPinned: !widget.isPinned });
    }
  };

  const handleWidgetSettings = (widgetId: string) => {
    setSelectedWidget(widgetId);
    setIsWidgetSettingsOpen(true);
  };

  // Widget rendering
  const renderWidget = (widget: Widget) => {
    const commonProps = {
      widget,
      isEditing,
      onRemove: () => handleRemoveWidget(widget.id),
      onMinimize: () => handleToggleMinimize(widget.id),
      onPin: () => handleTogglePin(widget.id),
      onSettings: () => handleWidgetSettings(widget.id),
      onSelect: () => setSelectedWidget(widget.id),
      isSelected: selectedWidget === widget.id
    };

    switch (widget.type) {
      case 'search':
        return <SearchWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'community':
        return <CommunityWidget {...commonProps} />;
      case 'marketplace':
        return <MarketplaceWidget {...commonProps} />;
      case 'stats':
        return <StatsWidget {...commonProps} />;
      default:
        return <div>Unknown widget type: {widget.type}</div>;
    }
  };

  // Helper functions
  const getWidgetTitle = (type: WidgetType): string => {
    const titles = {
      search: 'Universal Search',
      news: 'News & Alerts',
      community: 'Community',
      marketplace: 'Marketplace',
      stats: 'Statistics'
    };
    return titles[type] || 'Widget';
  };

  const getDefaultWidgetConfig = (type: WidgetType): WidgetConfig => {
    const configs = {
      search: {
        enableVoice: true,
        enableImage: true,
        privacyMode: false,
        autoComplete: true
      },
      news: {
        categories: ['health', 'tech', 'community'],
        autoRefresh: true,
        maxItems: 10
      },
      community: {
        showOnlineUsers: true,
        enableChat: true,
        showRecentActivity: true
      },
      marketplace: {
        showRecommendations: true,
        categories: ['wellness', 'fitness', 'mental-health'],
        sortBy: 'popularity'
      },
      stats: {
        timeRange: '7d',
        showCharts: true,
        refreshInterval: 300
      }
    };
    return configs[type] || {};
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800', className)}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Search */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  CareConnect
                </span>
              </div>

              {/* Global Search */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search anything... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    className="pl-10 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Quick Launch */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsQuickLaunchOpen(!isQuickLaunchOpen)}
                className="relative"
              >
                <Grid className="w-4 h-4" />
                {isQuickLaunchOpen && (
                  <div className="absolute top-full right-0 mt-2">
                    <QuickLaunch />
                  </div>
                )}
              </Button>

              {/* Command Palette */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openCommand}
                className="hidden sm:flex"
              >
                <Command className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* Edit Mode Toggle */}
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hidden sm:flex"
              >
                {isEditing ? "Done" : "Edit"}
              </Button>

              {/* User Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">{user?.name || 'User'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal steward is ready to help you with anything you need.
          </p>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {widgets.map((widget) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative',
                  widget.isMinimized && 'h-12',
                  widget.isPinned && 'ring-2 ring-blue-500'
                )}
              >
                {renderWidget(widget)}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Widget Button */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="h-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Add Widget
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(['search', 'news', 'community', 'marketplace', 'stats'] as WidgetType[]).map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddWidget(type)}
                        className="text-xs"
                      >
                        {getWidgetTitle(type)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Empty State */}
        {widgets.length === 0 && !isEditing && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No widgets yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Add some widgets to get started with your personalized dashboard.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Widgets
            </Button>
          </div>
        )}
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={closeCommand}
      />

      {/* Widget Settings Modal */}
      {isWidgetSettingsOpen && selectedWidget && (
        <WidgetSettings
          widget={widgets.find(w => w.id === selectedWidget)!}
          isOpen={isWidgetSettingsOpen}
          onClose={() => {
            setIsWidgetSettingsOpen(false);
            setSelectedWidget(null);
          }}
          onSave={(config) => {
            updateWidget(selectedWidget, { config });
            setIsWidgetSettingsOpen(false);
            setSelectedWidget(null);
          }}
        />
      )}
    </div>
  );
};
