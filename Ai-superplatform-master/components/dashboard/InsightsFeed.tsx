"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";

interface Insight {
  id: string;
  content: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

interface InsightsData {
  insights: Insight[];
  unreadCount: number;
  total: number;
}

interface InsightsFeedProps {
  onInsightUpdate?: () => void;
  compact?: boolean;
  maxInsights?: number;
  showFilters?: boolean;
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

export default function InsightsFeed({
  onInsightUpdate,
  compact = false,
  maxInsights = 10,
  showFilters = true,
}: InsightsFeedProps) {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchInsights = async() => {
    setIsLoading(true);
    try {
      let url = `/api/insights?limit=${maxInsights}`;

      if (filter === "unread") {
        url += "&unreadOnly=true";
      }
      if (categoryFilter !== "all") {
        url += `&category=${categoryFilter}`;
      }
      if (priorityFilter !== "all") {
        url += `&priority=${priorityFilter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInsightsData(data);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filter, categoryFilter, priorityFilter, maxInsights]);

  const markAsRead = async(insightId: string) => {
    try {
      const response = await fetch("/api/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightIds: [insightId] }),
      });

      if (response.ok) {
        fetchInsights();
        onInsightUpdate?.();
      }
    } catch (error) {
      console.error("Error marking insight as read:", error);
    }
  };

  const markAllAsRead = async() => {
    try {
      const response = await fetch("/api/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        fetchInsights();
        onInsightUpdate?.();
      }
    } catch (error) {
      console.error("Error marking all insights as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
return "Just now";
}
    if (diffInHours < 24) {
return `${diffInHours}h ago`;
}
    if (diffInHours < 48) {
return "Yesterday";
}
    return date.toLocaleDateString();
  };

  const filteredInsights = insightsData?.insights || [];

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading insights...
      </div>
    );
  }

  if (filteredInsights.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No insights yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Your AI companion will generate insights based on your activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      {showFilters && !compact && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="WELLNESS">Wellness</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Insights list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredInsights.map((insight) => {
          const CategoryIcon = categoryIcons[insight.category as keyof typeof categoryIcons] || Heart;

          return (
            <Card
              key={insight.id}
              className={`transition-all duration-200 ${
                insight.isRead ? "opacity-75" : "ring-2 ring-blue-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryIcon className="h-4 w-4 text-gray-500" />
                      <Badge
                        variant="secondary"
                        className={`text-xs ${categoryColors[insight.category as keyof typeof categoryColors]}`}
                      >
                        {insight.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${priorityColors[insight.priority as keyof typeof priorityColors]}`}
                      >
                        {insight.priority}
                      </Badge>
                      {!insight.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {insight.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(insight.createdAt)}
                      </div>

                      {!insight.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => markAsRead(insight.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer actions */}
      {!compact && insightsData?.unreadCount > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {insightsData.unreadCount} unread insight{insightsData.unreadCount !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
