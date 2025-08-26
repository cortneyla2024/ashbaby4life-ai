import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/database";
import { generateAIResponse } from "@/lib/ai";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const games = await prisma.generatedGame.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPublic: true },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Generate game content using AI
    const gameGenerationPrompt = `Create a web-based game based on this description: "${prompt}". 
    Generate a complete game with HTML, CSS, and JavaScript. The game should be interactive, engaging, and suitable for the described audience.`;

    const generatedCode = await generateAIResponse(gameGenerationPrompt, {
      userId: "system",
      conversationHistory: [],
      module: "dream-weaver",
    });

    // Determine game type based on prompt
    const gameType = determineGameType(prompt);

    // Generate title and description
    const title = generateGameTitle(prompt);
    const description = generateGameDescription(prompt);

    const game = await prisma.generatedGame.create({
      data: {
        userId: user.id,
        title,
        description,
        gameType,
        rules: "Game rules will be generated based on the game type",
        code: generatedCode.content,
        difficulty: "medium",
        duration: 30,
        assets: JSON.stringify({ type: "generated", prompt }),
        isPublic: false,
      },
    });

    return NextResponse.json({ game });
  } catch (error) {
    console.error("Error generating game:", error);
    return NextResponse.json(
      { error: "Failed to generate game" },
      { status: 500 }
    );
  }
}

function determineGameType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("puzzle") || lowerPrompt.includes("solve")) {
return "puzzle";
}
  if (lowerPrompt.includes("trivia") || lowerPrompt.includes("question")) {
return "trivia";
}
  if (lowerPrompt.includes("adventure") || lowerPrompt.includes("story")) {
return "adventure";
}
  if (lowerPrompt.includes("social") || lowerPrompt.includes("multiplayer")) {
return "social";
}
  if (lowerPrompt.includes("strategy") || lowerPrompt.includes("planning")) {
return "strategy";
}
  if (lowerPrompt.includes("creative") || lowerPrompt.includes("art")) {
return "creative";
}

  return "puzzle";
}

function generateGameTitle(prompt: string): string {
  const words = prompt.split(" ").slice(0, 4);
  return words.join(" ").replace(/[^a-zA-Z0-9\s]/g, "") + " Game";
}

function generateGameDescription(prompt: string): string {
  return `An interactive game created based on: "${prompt}". This game is designed to be engaging and educational.`;
}
