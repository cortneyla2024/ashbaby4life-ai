import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // month, week, year

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Fetch all financial data for the user
    const [transactions, budgets, financialGoals] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startDate,
            lte: now,
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
      }),
      prisma.financialGoal.findMany({
        where: { userId: user.id },
      }),
    ]);

    // Calculate financial summary
    const totalIncome = transactions
      .filter(t => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Calculate expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === "Expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Calculate budget progress
    const budgetProgress = budgets.map(budget => {
      const spent = expensesByCategory[budget.category] || 0;
      const progress = (spent / budget.amount) * 100;
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        progress,
        isOverBudget: spent > budget.amount,
      };
    });

    // Calculate goal progress
    const goalProgress = financialGoals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysRemaining = goal.deadline
        ? Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...goal,
        progress,
        remaining,
        daysRemaining,
        isOnTrack: daysRemaining !== null && daysRemaining > 0 && progress >= (daysRemaining / 365) * 100,
      };
    });

    // Generate AI insights
    let aiInsights = "";
    try {
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Analyze this financial data and provide personalized insights and actionable advice:

Financial Summary for ${period}:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Income: $${netIncome.toFixed(2)}

Top Expense Categories:
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join("\n")}

Budget Status:
${budgetProgress
  .map(b => `- ${b.name} (${b.category}): ${b.progress.toFixed(1)}% used, ${b.isOverBudget ? "OVER BUDGET" : "on track"}`)
  .join("\n")}

Financial Goals:
${goalProgress
  .map(g => `- ${g.name}: ${g.progress.toFixed(1)}% complete, ${g.daysRemaining} days remaining`)
  .join("\n")}

Please provide:
1. 2-3 key insights about spending patterns
2. 2-3 actionable recommendations for improvement
3. Specific advice for achieving financial goals
4. Any concerning trends to watch

Keep the response concise and practical.`,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        aiInsights = aiData.response || "";
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      aiInsights = "AI insights temporarily unavailable.";
    }

    const summary = {
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      overview: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate: totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0,
      },
      expensesByCategory,
      budgetProgress,
      goalProgress,
      recentTransactions: transactions.slice(0, 10),
      aiInsights,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating financial summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
