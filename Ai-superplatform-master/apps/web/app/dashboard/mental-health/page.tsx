"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  TrendingUp, 
  BookOpen, 
  ClipboardList, 
  Brain, 
  Activity, 
  Moon, 
  Sparkles,
  Calendar,
  Target,
  Users,
  Shield
} from "lucide-react";
import DailyMoodTracker from "@/components/mental-health/DailyMoodTracker";
import MoodHistoryChart from "@/components/mental-health/MoodHistoryChart";
import ResourceLibrary from "@/components/mental-health/ResourceLibrary";
import AssessmentWizard from "@/components/mental-health/AssessmentWizard";

export default function MentalHealthDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Current Streak",
      value: "7 days",
      icon: Heart,
      color: "text-pink-500",
      description: "Mood tracking streak",
    },
    {
      title: "Average Mood",
      value: "7.2/10",
      icon: TrendingUp,
      color: "text-blue-500",
      description: "Last 30 days",
    },
    {
      title: "Resources Saved",
      value: "12",
      icon: BookOpen,
      color: "text-green-500",
      description: "Coping strategies",
    },
    {
      title: "Assessments",
      value: "3",
      icon: ClipboardList,
      color: "text-purple-500",
      description: "Completed this month",
    },
  ];

  const quickActions = [
    {
      title: "Track Today's Mood",
      description: "Log your current mood and thoughts",
      icon: Heart,
      action: () => setActiveTab("mood"),
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Take Assessment",
      description: "Screen for depression or anxiety",
      icon: ClipboardList,
      action: () => setActiveTab("assessment"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Browse Resources",
      description: "Find coping strategies and tools",
      icon: BookOpen,
      action: () => setActiveTab("resources"),
      color: "bg-green-100 text-green-600",
    },
    {
      title: "View History",
      description: "See your mood trends over time",
      icon: TrendingUp,
      action: () => setActiveTab("mood"),
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const wellnessTips = [
    {
      tip: "Practice deep breathing for 5 minutes when feeling overwhelmed",
      category: "Stress Management",
      icon: Activity,
    },
    {
      tip: "Write down three things you're grateful for today",
      category: "Gratitude",
      icon: Heart,
    },
    {
      tip: "Take a 10-minute walk outside to clear your mind",
      category: "Physical Activity",
      icon: TrendingUp,
    },
    {
      tip: "Connect with a friend or family member today",
      category: "Social Connection",
      icon: Users,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mental Health Dashboard</h1>
        <p className="text-muted-foreground">
          Track your mood, access resources, and monitor your mental wellness journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
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

          {/* Wellness Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                Today's Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wellnessTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tip.category}</p>
                        <p className="text-sm text-muted-foreground">{tip.tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyMoodTracker />
            <MoodHistoryChart />
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourceLibrary />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <AssessmentWizard />
        </TabsContent>
      </Tabs>

      {/* Footer Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your Mental Health Matters</p>
              <p>
                This platform is designed to support your mental wellness journey. Remember that these tools are for
                self-reflection and support, not a replacement for professional mental health care. If you&apos;re experiencing
                severe symptoms or thoughts of self-harm, please reach out to a mental health professional or call a
                crisis hotline immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

