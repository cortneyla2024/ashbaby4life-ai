import { PrismaClient } from '@prisma/client';
import { ollamaClient } from '../lib/ai/ollama-client';

const prisma = new PrismaClient();

// Test wellness check functionality
async function testWellnessCheck() {
  console.log('🧠 Testing Proactive Wellness Engine...\n');

  try {
    // Get wellness snapshot for a user (assuming first user exists)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    console.log(`👤 Testing with user: ${user.username || user.email}\n`);

    // Get wellness snapshot
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      recentMoodEntries,
      recentTransactions,
      recentSocialActivity,
      recentHabits,
      recentJournalEntries
    ] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: user.id, createdAt: { gte: oneWeekAgo } }
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, createdAt: { gte: oneWeekAgo } }
      }),
      prisma.communityPost.findMany({
        where: { authorId: user.id, createdAt: { gte: oneWeekAgo } }
      }),
      prisma.habitLog.findMany({
        where: { habit: { userId: user.id }, date: { gte: oneWeekAgo } },
        include: { habit: true }
      }),
      prisma.journalEntry.findMany({
        where: { userId: user.id, createdAt: { gte: oneWeekAgo } }
      })
    ]);

    console.log('📊 Data Summary:');
    console.log(`   Mood entries: ${recentMoodEntries.length}`);
    console.log(`   Transactions: ${recentTransactions.length}`);
    console.log(`   Social posts: ${recentSocialActivity.length}`);
    console.log(`   Habit logs: ${recentHabits.length}`);
    console.log(`   Journal entries: ${recentJournalEntries.length}\n`);

    // Calculate metrics
    const moodScores = recentMoodEntries.map(entry => entry.moodScore);
    const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
    const moodTrend = moodScores.length >= 2 ? 
      (moodScores[0] > moodScores[moodScores.length - 1] ? 'declining' : 
       moodScores[0] < moodScores[moodScores.length - 1] ? 'improving' : 'stable') : 'insufficient data';

    const expenses = recentTransactions.filter(t => t.type === 'Expense');
    const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
    const spendingByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const completedHabits = recentHabits.filter(log => log.isCompleted).length;
    const totalHabitOpportunities = recentHabits.length;
    const habitCompletionRate = totalHabitOpportunities > 0 ? 
      (completedHabits / totalHabitOpportunities * 100).toFixed(1) : '0';

    // Build snapshot
    const snapshot = `
Data Snapshot:
- Mood Trend: ${moodTrend} (Avg: ${avgMood.toFixed(1)}/10, ${recentMoodEntries.length} entries)
- Financials: Total spending $${totalSpending.toFixed(2)} this week. Top categories: ${Object.entries(spendingByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} ($${amt.toFixed(2)})`)
    .join(', ')}
- Social: ${recentSocialActivity.length} community posts this week
- Growth: Habit completion rate: ${habitCompletionRate}% (${completedHabits}/${totalHabitOpportunities})
- Journal: ${recentJournalEntries.length} entries this week
- Recent Activity: Last active ${recentMoodEntries.length > 0 ? 
    Math.floor((Date.now() - recentMoodEntries[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 'unknown'} days ago
`.trim();

    console.log('📋 Wellness Snapshot:');
    console.log(snapshot);
    console.log('\n🤖 Generating AI Insight...\n');

    // Generate insight
    const prompt = `You are a proactive wellness analyst for the AI Life Companion. Your task is to analyze a user's weekly data snapshot and identify potential risks or positive opportunities. Generate a single, concise, empathetic, and actionable insight. Do not be alarming. Focus on gentle suggestions. Categorize the insight as WELLNESS, FINANCE, SOCIAL, or GROWTH, and set a priority.

Data Snapshot:
${snapshot}

Return ONLY a JSON object with the fields: "content", "category", "priority".

Guidelines:
- Content should be 1-2 sentences, friendly and actionable
- Category: WELLNESS (mood, health), FINANCE (spending, savings), SOCIAL (connections), GROWTH (habits, learning)
- Priority: LOW (gentle reminder), MEDIUM (notable pattern), HIGH (important trend)
- Be encouraging and supportive, never judgmental
- Focus on patterns and opportunities, not problems`;

    const response = await ollamaClient.chat({
      model: 'llama2',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.message?.content || '';
    console.log('🤖 AI Response:');
    console.log(content);
    console.log('\n');

    // Try to parse JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insight = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed Insight:');
        console.log(`   Content: ${insight.content}`);
        console.log(`   Category: ${insight.category}`);
        console.log(`   Priority: ${insight.priority}\n`);

        // Save to database
        await prisma.proactiveInsight.create({
          data: {
            userId: user.id,
            content: insight.content,
            category: insight.category,
            priority: insight.priority
          }
        });

        console.log('💾 Insight saved to database!');
      } else {
        console.log('⚠️  Could not parse JSON from AI response');
      }
    } catch (error) {
      console.log('❌ Error parsing AI response:', error);
    }

  } catch (error) {
    console.error('❌ Error during wellness check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testWellnessCheck();
