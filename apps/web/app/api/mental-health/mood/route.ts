import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood, energy, notes, activities } = await request.json();

    // Validate input
    if (!mood || typeof mood !== 'number' || mood < 1 || mood > 10) {
      return NextResponse.json(
        { error: 'Mood must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    if (energy && (typeof energy !== 'number' || energy < 1 || energy > 10)) {
      return NextResponse.json(
        { error: 'Energy must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    // Check if user already has a mood entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await prisma.healthData.findFirst({
      where: {
        userId: user.id,
        type: 'mood',
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    let moodEntry;
    const moodData = {
      mood,
      energy: energy || null,
      notes: notes || null,
      activities: activities || []
    };

    if (existingEntry) {
      // Update existing entry
      moodEntry = await prisma.healthData.update({
        where: { id: existingEntry.id },
        data: {
          data: JSON.stringify(moodData),
          timestamp: new Date()
        }
      });
    } else {
      // Create new entry
      moodEntry = await prisma.healthData.create({
        data: {
          userId: user.id,
          type: 'mood',
          data: JSON.stringify(moodData),
          timestamp: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      moodEntry
    });

  } catch (error) {
    console.error('Mood API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    const limit = parseInt(searchParams.get('limit') || '7');

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get mood entries
    const moodRecords = await prisma.healthData.findMany({
      where: {
        userId: user.id,
        type: 'mood',
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    const moodEntries = moodRecords.map(record => ({
      id: record.id,
      ...JSON.parse(record.data),
      createdAt: record.timestamp
    }));

    // Get today's entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntryRecord = await prisma.healthData.findFirst({
      where: {
        userId: user.id,
        type: 'mood',
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const todayEntry = todayEntryRecord ? {
      id: todayEntryRecord.id,
      ...JSON.parse(todayEntryRecord.data),
      createdAt: todayEntryRecord.timestamp
    } : null;

    // Calculate weekly averages for chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRecords = await prisma.healthData.findMany({
        where: {
          userId: user.id,
          type: 'mood',
          timestamp: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      });

      const dayEntries = dayRecords.map(record => ({
        ...JSON.parse(record.data),
        createdAt: record.timestamp
      }));

      const averageMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
        : 0;

      weeklyData.push({
        date: dayStart.toISOString().split('T')[0],
        averageMood: Math.round(averageMood * 10) / 10
      });
    }

    return NextResponse.json({
      success: true,
      moodEntries,
      todayEntry,
      weeklyData
    });

  } catch (error) {
    console.error('Mood API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
