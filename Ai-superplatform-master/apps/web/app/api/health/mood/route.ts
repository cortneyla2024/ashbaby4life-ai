import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const moodEntrySchema = z.object({
  mood: z.number().min(1).max(10),
  emotions: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  activities: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  coping_strategies: z.array(z.string()).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  energy_level: z.number().min(1).max(10).optional(),
  stress_level: z.number().min(1).max(10).optional(),
  anxiety_level: z.number().min(1).max(10).optional(),
  social_interaction: z.number().min(1).max(10).optional(),
  physical_symptoms: z.array(z.string()).optional(),
  medication_taken: z.boolean().optional(),
  weather: z.string().optional(),
  location: z.string().optional(),
  is_private: z.boolean().optional(),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 30),
  includeAnalytics: z.string().optional().transform(val => val === 'true'),
});

// Mock data store
let moodEntries = [
  {
    id: '1',
    userId: 'user-1',
    mood: 7,
    emotions: ['happy', 'excited', 'grateful'],
    notes: 'Great day at work, got promoted!',
    activities: ['work', 'exercise', 'socializing'],
    triggers: [],
    coping_strategies: ['exercise', 'meditation'],
    sleep_hours: 8,
    energy_level: 8,
    stress_level: 3,
    anxiety_level: 2,
    social_interaction: 9,
    physical_symptoms: [],
    medication_taken: true,
    weather: 'sunny',
    location: 'home',
    is_private: false,
    date: new Date('2024-01-15').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    mood: 4,
    emotions: ['sad', 'tired', 'overwhelmed'],
    notes: 'Stressful day, lots of deadlines',
    activities: ['work', 'commuting'],
    triggers: ['work_pressure', 'traffic'],
    coping_strategies: ['deep_breathing', 'music'],
    sleep_hours: 5,
    energy_level: 3,
    stress_level: 8,
    anxiety_level: 7,
    social_interaction: 2,
    physical_symptoms: ['headache', 'fatigue'],
    medication_taken: false,
    weather: 'rainy',
    location: 'office',
    is_private: true,
    date: new Date('2024-01-14').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    mood: 6,
    emotions: ['calm', 'content'],
    notes: 'Peaceful weekend morning',
    activities: ['reading', 'meditation', 'cooking'],
    triggers: [],
    coping_strategies: ['meditation', 'journaling'],
    sleep_hours: 9,
    energy_level: 6,
    stress_level: 2,
    anxiety_level: 1,
    social_interaction: 5,
    physical_symptoms: [],
    medication_taken: true,
    weather: 'cloudy',
    location: 'home',
    is_private: false,
    date: new Date('2024-01-13').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions for analytics
function calculateMoodTrends(entries: typeof moodEntries) {
  const last7Days = entries.slice(0, 7);
  const last30Days = entries.slice(0, 30);
  
  const avg7Days = last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length;
  const avg30Days = last30Days.reduce((sum, entry) => sum + entry.mood, 0) / last30Days.length;
  
  const trend = last7Days.length >= 2 ? 
    (last7Days[0].mood - last7Days[last7Days.length - 1].mood) > 0 ? 'improving' : 'declining' : 'stable';
  
  return {
    average7Days: Math.round(avg7Days * 10) / 10,
    average30Days: Math.round(avg30Days * 10) / 10,
    trend,
    bestDay: last30Days.reduce((best, entry) => entry.mood > best.mood ? entry : best, last30Days[0]),
    worstDay: last30Days.reduce((worst, entry) => entry.mood < worst.mood ? entry : worst, last30Days[0]),
  };
}

function analyzePatternsAndCorrelations(entries: typeof moodEntries) {
  // Sleep correlation
  const sleepCorrelation = entries.reduce((acc, entry) => {
    if (entry.sleep_hours) {
      acc.totalSleep += entry.sleep_hours;
      acc.totalMood += entry.mood;
      acc.count += 1;
    }
    return acc;
  }, { totalSleep: 0, totalMood: 0, count: 0 });
  
  // Common triggers
  const triggerCounts = entries.reduce((acc, entry) => {
    entry.triggers?.forEach(trigger => {
      acc[trigger] = (acc[trigger] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // Effective coping strategies
  const copingEffectiveness = entries.reduce((acc, entry) => {
    entry.coping_strategies?.forEach(strategy => {
      if (!acc[strategy]) {
        acc[strategy] = { count: 0, avgMood: 0, totalMood: 0 };
      }
      acc[strategy].count += 1;
      acc[strategy].totalMood += entry.mood;
      acc[strategy].avgMood = acc[strategy].totalMood / acc[strategy].count;
    });
    return acc;
  }, {} as Record<string, { count: number; avgMood: number; totalMood: number }>);
  
  // Mood by day of week
  const moodByDayOfWeek = entries.reduce((acc, entry) => {
    const dayOfWeek = new Date(entry.date).getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    if (!acc[dayName]) {
      acc[dayName] = { total: 0, count: 0, average: 0 };
    }
    acc[dayName].total += entry.mood;
    acc[dayName].count += 1;
    acc[dayName].average = acc[dayName].total / acc[dayName].count;
    
    return acc;
  }, {} as Record<string, { total: number; count: number; average: number }>);
  
  return {
    sleepMoodCorrelation: sleepCorrelation.count > 0 ? 
      Math.round((sleepCorrelation.totalSleep / sleepCorrelation.count) * 10) / 10 : 0,
    commonTriggers: Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count })),
    effectiveCopingStrategies: Object.entries(copingEffectiveness)
      .sort(([,a], [,b]) => b.avgMood - a.avgMood)
      .slice(0, 5)
      .map(([strategy, data]) => ({ 
        strategy, 
        avgMood: Math.round(data.avgMood * 10) / 10,
        usageCount: data.count 
      })),
    moodByDayOfWeek: Object.entries(moodByDayOfWeek)
      .map(([day, data]) => ({ 
        day, 
        averageMood: Math.round(data.average * 10) / 10,
        entryCount: data.count 
      })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Filter mood entries
    let filteredEntries = moodEntries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (query.startDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) >= new Date(query.startDate!)
      );
    }
    
    if (query.endDate) {
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.date) <= new Date(query.endDate!)
      );
    }
    
    // Apply limit
    const limitedEntries = filteredEntries.slice(0, query.limit);
    
    let response: any = {
      entries: limitedEntries,
      count: limitedEntries.length,
      totalCount: filteredEntries.length,
    };
    
    // Include analytics if requested
    if (query.includeAnalytics) {
      response.analytics = {
        trends: calculateMoodTrends(filteredEntries),
        patterns: analyzePatternsAndCorrelations(filteredEntries),
        streaks: {
          current: calculateCurrentStreak(filteredEntries),
          longest: calculateLongestStreak(filteredEntries),
        },
      };
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = moodEntrySchema.parse(body);
    
    // Get user ID from auth (mock for now)
    const userId = 'user-1';
    
    // Check if entry for today already exists
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = moodEntries.find(entry => 
      entry.userId === userId && 
      entry.date.split('T')[0] === today
    );
    
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Mood entry for today already exists. Use PUT to update.' },
        { status: 409 }
      );
    }
    
    // Create new mood entry
    const newEntry = {
      id: `mood-${Date.now()}`,
      userId,
      ...validatedData,
      emotions: validatedData.emotions || [],
      notes: validatedData.notes || '',
      activities: validatedData.activities || [],
      triggers: validatedData.triggers || [],
      coping_strategies: validatedData.coping_strategies || [],
      sleep_hours: validatedData.sleep_hours || 0,
      energy_level: validatedData.energy_level || 5,
      stress_level: validatedData.stress_level || 5,
      anxiety_level: validatedData.anxiety_level || 5,
      social_interaction: validatedData.social_interaction || 5,
      physical_symptoms: validatedData.physical_symptoms || [],
      medication_taken: validatedData.medication_taken || false,
      weather: validatedData.weather || '',
      location: validatedData.location || '',
      is_private: validatedData.is_private || false,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    moodEntries.unshift(newEntry); // Add to beginning to maintain date order
    
    // Generate AI insights based on the entry
    const insights = generateMoodInsights(newEntry, moodEntries.filter(e => e.userId === userId));
    
    return NextResponse.json({
      entry: newEntry,
      insights,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create mood entry' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateCurrentStreak(entries: typeof moodEntries): number {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].date);
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(entries: typeof moodEntries): number {
  let longestStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < entries.length; i++) {
    const currentDate = new Date(entries[i-1].date);
    const prevDate = new Date(entries[i].date);
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(longestStreak, currentStreak);
}

function generateMoodInsights(entry: any, userHistory: typeof moodEntries) {
  const insights = [];
  
  // Mood level insights
  if (entry.mood >= 8) {
    insights.push({
      type: 'positive',
      message: "Great to see you're feeling so positive today! What's contributing to this good mood?",
      category: 'mood_level',
    });
  } else if (entry.mood <= 3) {
    insights.push({
      type: 'concern',
      message: "I notice you're having a tough day. Remember, it's okay to feel this way sometimes. Consider reaching out to someone you trust.",
      category: 'mood_level',
    });
  }
  
  // Sleep correlation insights
  if (entry.sleep_hours && entry.sleep_hours < 6) {
    insights.push({
      type: 'suggestion',
      message: "You got less than 6 hours of sleep. Poor sleep can significantly impact mood. Try to prioritize rest tonight.",
      category: 'sleep',
    });
  }
  
  // Stress level insights
  if (entry.stress_level && entry.stress_level >= 8) {
    insights.push({
      type: 'suggestion',
      message: "Your stress level is quite high today. Consider trying some relaxation techniques like deep breathing or meditation.",
      category: 'stress',
    });
  }
  
  // Pattern recognition
  const recentEntries = userHistory.slice(0, 7);
  const avgRecentMood = recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length;
  
  if (entry.mood > avgRecentMood + 2) {
    insights.push({
      type: 'positive',
      message: "Your mood today is significantly better than your recent average. That's wonderful progress!",
      category: 'trend',
    });
  }
  
  return insights;
}
