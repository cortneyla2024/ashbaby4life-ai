"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, BookOpen, ClipboardList, Brain, Activity, Moon, Sparkles } from "lucide-react";
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
      description: "Record how you're feeling",
      icon: Heart,
      action: () => setActiveTab("mood"),
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
    },
    {
      title: "Take Assessment",
      description: "PHQ-9 or GAD-7 screening",
      icon: ClipboardList,
      action: () => setActiveTab("assessment"),
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
    {
      title: "Browse Resources",
      description: "Find coping strategies",
      icon: BookOpen,
      action: () => setActiveTab("resources"),
      color: "bg-green-50 border-green-200 hover:bg-green-100",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mental Health</h1>
          <p className="text-muted-foreground">
            Track your mood, discover resources, and monitor your mental wellness
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          v1.1 - Mental Health Module
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  onClick={action.action}
                  className={`h-auto p-4 flex flex-col items-start gap-2 ${action.color}`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Mood Tracker
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyMoodTracker />
            <MoodHistoryChart />
          </div>

          {/* Mental Health Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Today&apos;s Wellness Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Practice Gratitude:</strong>                   Take a moment each day to reflect on three things you&apos;re grateful for.
                  This simple practice can help shift your perspective and improve your overall mood and mental well-being.
                </p>
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
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
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
