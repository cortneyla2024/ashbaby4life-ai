"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  period: string;
  spent: number;
  remaining: number;
  progress: number;
  isOverBudget: boolean;
}

interface BudgetTrackerProps {
  budgets: Budget[];
}

export default function BudgetTracker({ budgets }: BudgetTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressColor = (progress: number, isOverBudget: boolean) => {
    if (isOverBudget) {
return "bg-red-500";
}
    if (progress >= 80) {
return "bg-yellow-500";
}
    return "bg-green-500";
  };

  const getProgressTextColor = (progress: number, isOverBudget: boolean) => {
    if (isOverBudget) {
return "text-red-600";
}
    if (progress >= 80) {
return "text-yellow-600";
}
    return "text-green-600";
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No budgets set up yet. Create your first budget to start tracking your spending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Budget Tracker
          <Badge variant="outline">
            {budgets.filter(b => b.isOverBudget).length} Over Budget
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{budget.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {budget.category} • {budget.period}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </p>
                <p className={`text-sm font-medium ${getProgressTextColor(budget.progress, budget.isOverBudget)}`}>
                  {budget.progress.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Progress
                value={Math.min(budget.progress, 100)}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Spent: {formatCurrency(budget.spent)}</span>
                <span className={budget.isOverBudget ? "text-red-600 font-medium" : ""}>
                  {budget.isOverBudget
                    ? `Over by ${formatCurrency(Math.abs(budget.remaining))}`
                    : `Remaining: ${formatCurrency(budget.remaining)}`
                  }
                </span>
              </div>
            </div>

            {budget.isOverBudget && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2">
                <p className="text-red-700 text-sm font-medium">
                  ⚠️ You&apos;re over budget by {formatCurrency(Math.abs(budget.remaining))}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
