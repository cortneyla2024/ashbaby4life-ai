"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  DollarSign,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Insight {
  id: string;
  content: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

const categoryIcons = {
  WELLNESS: Heart,
  FINANCE: DollarSign,
  SOCIAL: Users,
  GROWTH: TrendingUp,
};

const categoryColors = {
  WELLNESS: "bg-pink-100 text-pink-800",
  FINANCE: "bg-green-100 text-green-800",
  SOCIAL: "bg-blue-100 text-blue-800",
  GROWTH: "bg-purple-100 text-purple-800",
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

export default function InsightsWidget() {
  const [latestInsight, setLatestInsight] = useState<Insight | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLatestInsight = async() => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/insights?limit=1&priority=HIGH");
      if (response.ok) {
        const data = await response.json();
        if (data.insights.length > 0) {
          setLatestInsight(data.insights[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching latest insight:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestInsight();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestInsight) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No insights yet</p>
            <p className="text-sm text-gray-400">
              Your AI companion will generate personalized insights based on your activity
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CategoryIcon = categoryIcons[latestInsight.category as keyof typeof categoryIcons] || Heart;

  return (
    <Card className="w-full border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Wellness Insight
          </div>
          {!latestInsight.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-4 w-4 text-gray-500" />
            <Badge
              variant="secondary"
              className={`text-xs ${categoryColors[latestInsight.category as keyof typeof categoryColors]}`}
            >
              {latestInsight.category}
            </Badge>
            <Badge
              variant="secondary"
              className={`text-xs ${priorityColors[latestInsight.priority as keyof typeof priorityColors]}`}
            >
              {latestInsight.priority} Priority
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed">
              {latestInsight.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Generated {new Date(latestInsight.createdAt).toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.location.href = "/dashboard/insights"}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
