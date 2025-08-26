"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransactionForm from "@/components/finance/TransactionForm";
import BudgetTracker from "@/components/finance/BudgetTracker";
import FinancialGoalCard from "@/components/finance/FinancialGoalCard";
import FinanceDashboardChart from "@/components/finance/FinanceDashboardChart";
import TransactionList from "@/components/finance/TransactionList";

interface FinancialSummary {
  period: string;
  overview: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;
  };
  expensesByCategory: Record<string, number>;
  budgetProgress: any[];
  goalProgress: any[];
  recentTransactions: any[];
  aiInsights: string;
}

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransactionList, setShowTransactionList] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const fetchSummary = async() => {
    try {
      const response = await fetch(`/api/finance/summary?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [period]);

  const handleTransactionAdded = () => {
    fetchSummary();
  };

  const handleGoalProgressUpdate = async(goalId: string, newAmount: number) => {
    try {
      const response = await fetch(`/api/finance/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentAmount: newAmount }),
      });

      if (response.ok) {
        fetchSummary();
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Wellness</h1>
          <p className="text-muted-foreground">
            Track your spending, manage budgets, and achieve your financial goals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowTransactionForm(true)}>
            + Add Transaction
          </Button>
        </div>
      </div>

      {summary && (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <Badge className="bg-green-100 text-green-800">↗️</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.overview.totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Badge className="bg-red-100 text-red-800">↘️</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.overview.totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <Badge className={summary.overview.netIncome >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {summary.overview.netIncome >= 0 ? "💰" : "⚠️"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.overview.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.overview.netIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">📈</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.overview.savingsRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {summary.aiInsights && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI Financial Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{summary.aiInsights}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts and Budgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinanceDashboardChart
              expensesByCategory={summary.expensesByCategory}
              recentTransactions={summary.recentTransactions}
              period={period}
            />
            <BudgetTracker budgets={summary.budgetProgress} />
          </div>

          {/* Financial Goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Financial Goals</h2>
              <Button variant="outline" size="sm">
                + Add Goal
              </Button>
            </div>

            {summary.goalProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.goalProgress.map((goal) => (
                  <FinancialGoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleGoalProgressUpdate}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No financial goals set yet. Create your first goal to start building wealth.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Transactions</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransactionList(!showTransactionList)}
              >
                {showTransactionList ? "Hide Details" : "View All"}
              </Button>
            </div>

            {showTransactionList ? (
              <TransactionList
                transactions={summary.recentTransactions}
                pagination={{ page: 1, limit: 10, total: summary.recentTransactions.length, pages: 1 }}
                onPageChange={() => {}}
                onFilterChange={() => {}}
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-3 p-6">
                    {summary.recentTransactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xl">
                            {transaction.type === "Income" ? "↗️" : "↘️"}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === "Income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "Income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSubmit={handleTransactionAdded}
      />
    </div>
  );
}
