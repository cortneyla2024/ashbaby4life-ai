"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Calendar, Clock } from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";

interface MoodEntry {
  id: string;
  moodScore: number;
  notes?: string;
  tags: string[];
  aiInsight?: string;
  createdAt: string;
}

interface ChartData {
  date: string;
  mood: number;
  count: number;
}

const timeRanges = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 3 Months" },
];

export default function MoodHistoryChart() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState("7");
  const [isLoading, setIsLoading] = useState(true);
  const [averageMood, setAverageMood] = useState(0);

  useEffect(() => {
    fetchMoodEntries();
  }, []);

  useEffect(() => {
    processChartData();
  }, [moodEntries, timeRange]);

  const fetchMoodEntries = async() => {
    try {
      const response = await fetch("/api/mental-health/mood?limit=100");
      if (response.ok) {
        const data = await response.json();
        setMoodEntries(data.moodEntries);
      }
    } catch (error) {
      console.error("Error fetching mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = () => {
    if (!moodEntries.length) {
      setChartData([]);
      setAverageMood(0);
      return;
    }

    const days = parseInt(timeRange);
    const startDate = subDays(new Date(), days - 1);

    // Create date range
    const dateRange: { [key: string]: { total: number; count: number } } = {};

    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - 1 - i);
      const dateKey = format(date, "yyyy-MM-dd");
      dateRange[dateKey] = { total: 0, count: 0 };
    }

    // Process mood entries
    moodEntries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate >= startDate) {
        const dateKey = format(entryDate, "yyyy-MM-dd");
        if (dateRange[dateKey]) {
          dateRange[dateKey].total += entry.moodScore;
          dateRange[dateKey].count += 1;
        }
      }
    });

    // Convert to chart data
    const processedData: ChartData[] = Object.entries(dateRange).map(([date, data]) => ({
      date: format(new Date(date), "MMM dd"),
      mood: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
      count: data.count,
    }));

    setChartData(processedData);

    // Calculate average mood
    const validEntries = moodEntries.filter(entry => new Date(entry.createdAt) >= startDate);
    if (validEntries.length > 0) {
      const total = validEntries.reduce((sum, entry) => sum + entry.moodScore, 0);
      setAverageMood(Math.round((total / validEntries.length) * 10) / 10);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) {
return "#8b5cf6";
} // Purple
    if (score >= 6) {
return "#3b82f6";
} // Blue
    if (score >= 4) {
return "#f59e0b";
} // Yellow
    return "#ef4444"; // Red
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Mood: {data.mood}/10
          </p>
          {data.count > 0 && (
            <p className="text-sm text-muted-foreground">
              Entries: {data.count}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mood History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {averageMood > 0 && (
          <p className="text-sm text-muted-foreground">
            Average mood: <span className="font-medium">{averageMood}/10</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke={getMoodColor(averageMood)}
                  fill={getMoodColor(averageMood)}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No mood data available</p>
              <p className="text-sm text-muted-foreground">
                Start tracking your mood to see your history here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
