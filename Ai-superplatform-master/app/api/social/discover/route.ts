import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gather user data for AI analysis
    const [
      userGoals,
      journalEntries,
      moodEntries,
      financialGoals,
      existingCommunities,
      existingEvents,
    ] = await Promise.all([
      // Get user's goals
      prisma.goal.findMany({
        where: { userId: user.id, status: "active" },
        select: { title: true, category: true, description: true },
      }),
      // Get recent journal entries
      prisma.journalEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { content: true, tags: true, mood: true },
      }),
      // Get recent mood entries
      prisma.moodEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { notes: true, tags: true, moodScore: true },
      }),
      // Get financial goals
      prisma.financialGoal.findMany({
        where: { userId: user.id },
        select: { name: true, priority: true },
      }),
      // Get user's current community memberships
      prisma.communityMember.findMany({
        where: { userId: user.id },
        include: {
          community: {
            select: { name: true, description: true },
          },
        },
      }),
      // Get user's event RSVPs
      prisma.eventRSVP.findMany({
        where: { userId: user.id },
        include: {
          event: {
            select: { name: true, description: true },
          },
        },
      }),
    ]);

    // Prepare user profile for AI analysis
    const userProfile = {
      goals: userGoals.map(g => ({ title: g.title, category: g.category, description: g.description })),
      journalThemes: journalEntries.map(j => ({ content: j.content, tags: j.tags, mood: j.mood })),
      moodPatterns: moodEntries.map(m => ({ notes: m.notes, tags: m.tags, score: m.moodScore })),
      financialInterests: financialGoals.map(f => ({ name: f.name, priority: f.priority })),
      currentCommunities: existingCommunities.map(c => c.community.name),
      currentEvents: existingEvents.map(e => e.event.name),
    };

    // Get available communities and events for suggestions
    const [communities, events] = await Promise.all([
      prisma.community.findMany({
        where: {
          isPublic: true,
          id: { notIn: existingCommunities.map(c => c.communityId) },
        },
        include: {
          owner: {
            select: { username: true, name: true },
          },
          _count: {
            select: { members: true, posts: true },
          },
        },
        take: 20,
      }),
      prisma.event.findMany({
        where: {
          isPublic: true,
          date: { gte: new Date() },
          id: { notIn: existingEvents.map(e => e.eventId) },
        },
        include: {
          organizer: {
            select: { username: true, name: true },
          },
          _count: {
            select: { rsvps: true },
          },
        },
        take: 20,
      }),
    ]);

    // Call AI for personalized recommendations
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Analyze this user's profile and suggest the most relevant communities and events for them.

User Profile:
- Goals: ${userProfile.goals.map(g => `${g.title} (${g.category})`).join(", ")}
- Journal Themes: ${userProfile.journalThemes.map(j => j.tags.join(", ")).flat().join(", ")}
- Mood Patterns: ${userProfile.moodPatterns.map(m => m.tags.join(", ")).flat().join(", ")}
- Financial Interests: ${userProfile.financialInterests.map(f => f.name).join(", ")}
- Current Communities: ${userProfile.currentCommunities.join(", ")}
- Current Events: ${userProfile.currentEvents.join(", ")}

Available Communities:
${communities.map(c => `- ${c.name}: ${c.description} (${c._count.members} members, ${c._count.posts} posts)`).join("\n")}

Available Events:
${events.map(e => `- ${e.name}: ${e.description} on ${e.date.toISOString().split("T")[0]} (${e._count.rsvps} RSVPs)`).join("\n")}

Please provide:
1. Top 3 community recommendations with brief explanations
2. Top 3 event recommendations with brief explanations
3. General insights about the user's social connection patterns
4. Suggestions for expanding their social network

Format the response as JSON with keys: communities, events, insights, suggestions`,
      }),
    });

    let aiRecommendations;
    try {
      const aiData = await aiResponse.json();
      aiRecommendations = aiData.response ? JSON.parse(aiData.response) : null;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      aiRecommendations = null;
    }

    // If AI fails, provide basic recommendations
    if (!aiRecommendations) {
      aiRecommendations = {
        communities: communities.slice(0, 3).map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          reason: "Based on general popularity and activity",
        })),
        events: events.slice(0, 3).map(e => ({
          id: e.id,
          name: e.name,
          description: e.description,
          reason: "Upcoming event with good attendance",
        })),
        insights: "Consider joining communities that align with your goals and interests.",
        suggestions: "Look for events that match your schedule and interests.",
      };
    }

    return NextResponse.json({
      recommendations: aiRecommendations,
      availableCommunities: communities,
      availableEvents: events,
      userProfile: {
        goalCount: userGoals.length,
        journalEntryCount: journalEntries.length,
        communityCount: existingCommunities.length,
        eventCount: existingEvents.length,
      },
    });
  } catch (error) {
    console.error("Error generating discovery recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
