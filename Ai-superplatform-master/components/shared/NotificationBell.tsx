"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InsightsFeed from "@/components/dashboard/InsightsFeed";

interface InsightsData {
  insights: any[];
  unreadCount: number;
  total: number;
}

export default function NotificationBell() {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchInsights = async() => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/insights?limit=5&unreadOnly=true");
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
  }, []);

  const handleInsightUpdate = () => {
    // Refresh insights when they're marked as read
    fetchInsights();
  };

  const unreadCount = insightsData?.unreadCount || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          onClick={() => setIsOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Wellness Insights</h3>
          <p className="text-xs text-gray-500 mt-1">
            AI-powered insights about your wellness journey
          </p>
        </div>
        <InsightsFeed
          onInsightUpdate={handleInsightUpdate}
          compact={true}
          maxInsights={5}
        />
      </PopoverContent>
    </Popover>
  );
}
