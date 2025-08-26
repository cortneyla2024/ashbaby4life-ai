"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Target, 
  Users,
  Palette,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Activity,
  Moon,
  Sun,
  MessageSquare,
  Video,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  });

  const modules = [
    {
      title: "Mental Health",
      description: "Track mood, access resources, and monitor wellness",
      icon: Brain,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/dashboard/mental-health",
      stats: {
        currentStreak: "7 days",
        averageMood: "7.2/10",
        resourcesSaved: "12"
      }
    },
    {
      title: "Financial Wellness",
      description: "Manage budgets, track expenses, and plan goals",
      icon: DollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      href: "/dashboard/financial",
      stats: {
        totalBalance: "$12,450",
        monthlySavings: "28.9%",
        budgetAlerts: "2"
      }
    },
    {
      title: "Learning & Growth",
      description: "Track skills, build habits, and access resources",
      icon: BookOpen,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      href: "/dashboard/learning",
      stats: {
        activeSkills: "5",
        currentStreak: "12 days",
        resourcesCompleted: "8"
      }
    },
    {
      title: "Creative Expression",
      description: "Generate art, write, and explore creativity",
      icon: Palette,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      href: "/dashboard/creative",
      stats: {
        projectsCreated: "15",
        imagesGenerated: "42",
        writingSessions: "8"
      }
    },
    {
      title: "Social Connection",
      description: "Connect with communities and build relationships",
      icon: Users,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      href: "/dashboard/social",
      stats: {
        communitiesJoined: "3",
        eventsAttended: "5",
        connectionsMade: "12"
      }
    },
    {
      title: "Life Automation",
      description: "Set up smart routines and automated workflows",
      icon: Zap,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      href: "/dashboard/automation",
      stats: {
        activeRoutines: "8",
        automationsTriggered: "156",
        timeSaved: "12h"
      }
    }
  ];

  const quickActions = [
    {
      title: "Track Today's Mood",
      description: "Log your current emotional state",
      icon: Heart,
      action: () => window.location.href = "/dashboard/mental-health",
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Add Transaction",
      description: "Record income or expense",
      icon: DollarSign,
      action: () => window.location.href = "/dashboard/financial",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Start Learning Session",
      description: "Continue your skill development",
      icon: BookOpen,
      action: () => window.location.href = "/dashboard/learning",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Create Something",
      description: "Generate art or write",
      icon: Palette,
      action: () => window.location.href = "/dashboard/creative",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const todayInsights = [
    {
      insight: "Your mood has been trending upward for the past 3 days",
      category: "Mental Health",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      insight: "You're on track to meet your savings goal this month",
      category: "Financial",
      icon: Target,
      color: "text-blue-600",
    },
    {
      insight: "Consider taking a 10-minute break to maintain focus",
      category: "Productivity",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      insight: "You have 2 upcoming events in your social calendar",
      category: "Social",
      icon: Calendar,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{greeting}, User!</h1>
        <p className="text-muted-foreground">
          Welcome to your personal life management dashboard. Here's an overview of your journey.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Life Modules Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Life Management Modules</h2>
          <Badge variant="secondary" className="text-sm">
            {modules.length} modules available
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link key={index} href={module.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${module.bgColor}`}>
                        <Icon className={`h-6 w-6 ${module.textColor}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(module.stats).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-medium">{value}</div>
                          <div className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today's Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Today's Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className={`h-4 w-4 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{insight.category}</p>
                    <p className="text-sm text-muted-foreground">{insight.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Companion Quick Access */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Your AI Companion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Need help with anything? Your AI companion is ready to assist with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mental health support and guidance</li>
                <li>• Financial planning and advice</li>
                <li>• Learning recommendations and tutoring</li>
                <li>• Creative inspiration and collaboration</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button size="sm">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Privacy</p>
                <p className="text-xs text-muted-foreground">All data encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




