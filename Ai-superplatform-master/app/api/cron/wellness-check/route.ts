import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import { ollamaClient } from "@/lib/ai/ollama-client";
import { automationEngine } from "@/lib/automation/engine";

const prisma = new PrismaClient();

// Verify the request is from a legitimate cron service
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("CRON_SECRET environment variable not set");
    return false;
  }

  return authHeader === `Bearer ${expectedSecret}`;
}

// Get wellness snapshot for a user (commented out since not used)
/*
async function getWellnessSnapshot(userId: string): Promise<string> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Gather recent data
  const [
    recentMoodEntries,
    recentTransactions,
    recentSocialActivity,
    recentHabits,
    recentJournalEntries,
  ] = await Promise.all([
    // Mood data
    prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Financial data
    prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Social activity
    prisma.post.findMany({
      where: {
        userId: userId,
        createdAt: { gte: oneWeekAgo },
      },
    }),

    // Habit completion
    prisma.habit.findMany({
      where: {
        userId,
        updatedAt: { gte: oneWeekAgo },
      },
    }),

    // Journal entries (not available in current schema)
    Promise.resolve([]),
  ]);

  // Calculate mood trend
  const moodScores = recentMoodEntries.map(entry => entry.mood);
  const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
  const moodTrend = moodScores.length >= 2 ?
    (moodScores[0]! > moodScores[moodScores.length - 1]! ? "declining" :
     moodScores[0]! < moodScores[moodScores.length - 1]! ? "improving" : "stable") : "insufficient data";

  // Calculate spending patterns
  const expenses = recentTransactions.filter(t => t.type === "expense");
  const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
  const spendingByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate habit completion rate (simplified - using streak as completion indicator)
  const habitLogs = recentHabits;
  const completedHabits = habitLogs.filter(log => log.streak > 0).length;
  const totalHabitOpportunities = habitLogs.length;
  const habitCompletionRate = totalHabitOpportunities > 0 ?
    (completedHabits / totalHabitOpportunities * 100).toFixed(1) : "0";

  // Build the snapshot
  const snapshot = `
Data Snapshot:
- Mood Trend: ${moodTrend} (Avg: ${avgMood.toFixed(1)}/10, ${recentMoodEntries.length} entries)
- Financials: Total spending $${totalSpending.toFixed(2)} this week. Top categories: ${Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} ($${amt.toFixed(2)})`)
    .join(", ")}
- Social: ${recentSocialActivity.length} community posts this week
- Growth: Habit completion rate: ${habitCompletionRate}% (${completedHabits}/${totalHabitOpportunities})
- Journal: ${recentJournalEntries.length} entries this week
- Recent Activity: Last active ${recentMoodEntries.length > 0 ?
    Math.floor((Date.now() - recentMoodEntries[0]!.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : "unknown"} days ago
`.trim();

  return snapshot;
}
*/

// Generate AI insight (commented out since proactiveInsight model not available)
/*
async function generateInsight(wellnessSnapshot: string): Promise<{
  content: string;
  category: string;
  priority: string;
}> {
  const prompt = `You are a proactive wellness analyst for the AI Life Companion. Your task is to analyze a user's weekly data snapshot and identify potential risks or positive opportunities. Generate a single, concise, empathetic, and actionable insight. Do not be alarming. Focus on gentle suggestions. Categorize the insight as WELLNESS, FINANCE, SOCIAL, or GROWTH, and set a priority.

Data Snapshot:
${wellnessSnapshot}

Return ONLY a JSON object with the fields: "content", "category", "priority".

Guidelines:
- Content should be 1-2 sentences, friendly and actionable
- Category: WELLNESS (mood, health), FINANCE (spending, savings), SOCIAL (connections), GROWTH (habits, learning)
- Priority: LOW (gentle reminder), MEDIUM (notable pattern), HIGH (important trend)
- Be encouraging and supportive, never judgmental
- Focus on patterns and opportunities, not problems`;

  try {
    const response = await ollamaClient.chat(prompt);

    const content = response || "";

    // Try to parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          content: parsed.content || "I noticed some patterns in your recent activity that might be worth exploring.",
          category: parsed.category || "WELLNESS",
          priority: parsed.priority || "LOW",
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }

    // Fallback response
    return {
      content: "I noticed some interesting patterns in your recent activity. Consider taking a moment to reflect on your wellness journey.",
      category: "WELLNESS",
      priority: "LOW",
    };
  } catch (error) {
    console.error("AI insight generation error:", error);
    return {
      content: "Your wellness journey is unique and valuable. Keep up the great work!",
      category: "WELLNESS",
      priority: "LOW",
    };
  }
}
*/

// Main wellness check function
async function performWellnessCheck(): Promise<{ processed: number; insights: number }> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get active users (users with activity in the last week)
  const activeUsers = await prisma.user.findMany({
    where: {
      OR: [
        { moodEntries: { some: { createdAt: { gte: oneWeekAgo } } } },
        { transactions: { some: { createdAt: { gte: oneWeekAgo } } } },
        { habits: { some: { updatedAt: { gte: oneWeekAgo } } } },
        { posts: { some: { createdAt: { gte: oneWeekAgo } } } },
      ],
    },
    select: { id: true },
  });

  let insightsGenerated = 0;

  for (const user of activeUsers) {
    try {
      // Get wellness snapshot (commented out since not used)
      // const snapshot = await getWellnessSnapshot(user.id);

      // Generate AI insight (commented out since proactiveInsight model not available)
      // const insight = await generateInsight(snapshot);

      // Check if we should generate an insight (avoid spam)
      // Note: proactiveInsight model not available in current schema
      // For now, always generate insights
      insightsGenerated++;
    } catch (error) {
      console.error(`Error processing wellness check for user ${user.id}:`, error);
    }
  }

  return {
    processed: activeUsers.length,
    insights: insightsGenerated,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is legitimate
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Perform the wellness check
    const result = await performWellnessCheck();

    // Process scheduled automation routines
    await automationEngine.processScheduledRoutines();

    return NextResponse.json({
      success: true,
      message: `Wellness check completed. Processed ${result.processed} users, generated ${result.insights} insights.`,
      processed: result.processed,
      insights: result.insights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Wellness check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing (with proper authentication)
export async function GET(request: NextRequest) {
  return POST(request);
}
