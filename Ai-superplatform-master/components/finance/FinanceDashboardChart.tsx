"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FinanceDashboardChartProps {
  expensesByCategory: Record<string, number>;
  recentTransactions: any[];
  period: string;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000",
  "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
];

export default function FinanceDashboardChart({
  expensesByCategory,
  recentTransactions,
  period,
}: FinanceDashboardChartProps) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Prepare data for pie chart
  const pieData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 categories

  // Prepare data for bar chart (income vs expenses over time)
  const barData = recentTransactions
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0 };
      }

      if (transaction.type === "Income") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expenses += transaction.amount;
      }

      return acc;
    }, {} as Record<string, any>);

  const barChartData = Object.values(barData).slice(-7); // Last 7 days

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" fill="#82ca9d" name="Income" />
        <Bar dataKey="expenses" fill="#ff7300" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );

  if (Object.keys(expensesByCategory).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No financial data available yet. Add some transactions to see your spending patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Overview</CardTitle>
          <Select value={chartType} onValueChange={(value: "pie" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "pie" ? renderPieChart() : renderBarChart()}

        {chartType === "pie" && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
                <span className="font-medium ml-auto">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
