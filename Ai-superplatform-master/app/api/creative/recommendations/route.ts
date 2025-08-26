import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OllamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();
const ollama = new OllamaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = "user123"; // This should come from token verification

    // Gather user preferences
    const mediaPreferences = await prisma.mediaPreference.findMany({
      where: { userId },
    });

    // Gather some context from user's recent activities (privacy-preserving)
    // const recentJournalEntries = await prisma.journalEntry.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: "desc" },
    //   take: 5,
    // });

    // const recentGoals = await prisma.financialGoal.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: "desc" },
    //   take: 3,
    // });

    // Create context for AI recommendations
    const context = {
      userPreferences: mediaPreferences.reduce((acc, pref) => {
        acc[pref.type] = {
          likes: pref.likes,
          dislikes: pref.dislikes,
        };
        return acc;
      }, {} as any),
      // recentMoods: recentJournalEntries.map(entry => entry.mood).filter(Boolean),
      // recentGoals: recentGoals.map(goal => goal.title),
    };

    // Generate recommendations using Ollama
    const recommendationPrompt = `Based on the following user context, provide personalized recommendations for movies, books, and music:

User Context:
- Media Preferences: ${JSON.stringify(context.userPreferences)}
- Recent Moods: ${/* context.recentMoods.join(", ") */ "Not available"}
- Recent Goals: ${/* context.recentGoals.join(", ") */ "Not available"}

Please provide 3 recommendations for each category (movies, books, music) that would be inspiring, entertaining, and relevant to the user's current state. 
For each recommendation, include:
1. Title
2. Brief description (1-2 sentences)
3. Why it's recommended
4. Genre/category

Format the response as a JSON object with the following structure:
{
  "movies": [
    {
      "title": "Movie Title",
      "description": "Brief description",
      "reason": "Why recommended",
      "genre": "Genre"
    }
  ],
  "books": [...],
  "music": [...]
}`;

    const recommendationsText = await ollama.generateText(recommendationPrompt, 1500);

    // Try to parse the JSON response, fallback to structured text if needed
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (error) {
      // Fallback: create a structured response from the text
      recommendations = {
        movies: [
          {
            title: "The Secret Life of Walter Mitty",
            description: "An inspiring adventure about stepping out of your comfort zone",
            reason: "Based on your recent goals and mood",
            genre: "Adventure/Comedy",
          },
        ],
        books: [
          {
            title: "Atomic Habits",
            description: "A practical guide to building good habits and breaking bad ones",
            reason: "Aligned with your personal growth goals",
            genre: "Self-Help",
          },
        ],
        music: [
          {
            title: "Lofi Hip Hop",
            description: "Relaxing instrumental music for focus and creativity",
            reason: "Perfect for your current mood and activities",
            genre: "Instrumental",
          },
        ],
      };
    }

    return NextResponse.json({
      recommendations,
      userContext: {
        hasPreferences: mediaPreferences.length > 0,
        // recentActivityCount: recentJournalEntries.length + recentGoals.length,
        recentActivityCount: 0,
      },
    });

  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
