"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: string;
  aiSuggestion?: string;
  progress: number;
  remaining: number;
  daysRemaining: number;
  isOnTrack: boolean;
}

interface FinancialGoalCardProps {
  goal: FinancialGoal;
  onUpdateProgress?: (goalId: string, newAmount: number) => void;
}

export default function FinancialGoalCard({ goal, onUpdateProgress }: FinancialGoalCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress: number, isOnTrack: boolean) => {
    if (progress >= 100) {
return "bg-green-500";
}
    if (isOnTrack) {
return "bg-blue-500";
}
    return "bg-yellow-500";
  };

  const getDaysRemainingText = (days: number) => {
    if (days < 0) {
return `${Math.abs(days)} days overdue`;
}
    if (days === 0) {
return "Due today";
}
    if (days === 1) {
return "1 day remaining";
}
    return `${days} days remaining`;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) {
return "text-red-600";
}
    if (days <= 7) {
return "text-orange-600";
}
    if (days <= 30) {
return "text-yellow-600";
}
    return "text-green-600";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{goal.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={getPriorityColor(goal.priority)}
              >
                {goal.priority} Priority
              </Badge>
              {goal.progress >= 100 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  🎉 Completed!
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <Progress
            value={Math.min(goal.progress, 100)}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{goal.progress.toFixed(1)}% complete</span>
            <span className={goal.isOnTrack ? "text-green-600" : "text-yellow-600"}>
              {goal.isOnTrack ? "On track" : "Behind schedule"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Target Date</p>
            <p className="font-medium">{formatDate(goal.targetDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Time Remaining</p>
            <p className={`font-medium ${getDaysRemainingColor(goal.daysRemaining)}`}>
              {getDaysRemainingText(goal.daysRemaining)}
            </p>
          </div>
        </div>

        {goal.remaining > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm font-medium">
              💰 {formatCurrency(goal.remaining)} still needed
            </p>
            {goal.daysRemaining > 0 && (
              <p className="text-blue-600 text-xs mt-1">
                Save {formatCurrency(goal.remaining / goal.daysRemaining)} per day to reach your goal
              </p>
            )}
          </div>
        )}

        {goal.aiSuggestion && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <p className="text-purple-800 text-sm font-medium mb-1">
              🤖 AI Suggestion
            </p>
            <p className="text-purple-700 text-sm">
              {goal.aiSuggestion}
            </p>
          </div>
        )}

        {goal.progress < 100 && onUpdateProgress && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const newAmount = prompt(
                  `Update progress for "${goal.name}"\nCurrent: ${formatCurrency(goal.currentAmount)}\nTarget: ${formatCurrency(goal.targetAmount)}\n\nEnter new amount:`
                );
                if (newAmount && !isNaN(parseFloat(newAmount))) {
                  onUpdateProgress(goal.id, parseFloat(newAmount));
                }
              }}
            >
              Update Progress
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
