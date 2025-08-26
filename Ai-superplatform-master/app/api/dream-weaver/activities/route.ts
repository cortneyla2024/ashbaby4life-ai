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

    const activities = await prisma.generatedActivity.findMany({
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

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
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

    // Generate activity content using AI
    const activityGenerationPrompt = `Create a detailed activity plan based on this description: "${prompt}". 
    Include step-by-step instructions, required materials, estimated duration, and learning objectives. 
    Make it engaging and suitable for the described audience.`;

    const generatedPlan = await generateAIResponse(activityGenerationPrompt, {
      userId: "system",
      conversationHistory: [],
      module: "dream-weaver",
    });

    // Determine activity type based on prompt
    const activityType = determineActivityType(prompt);

    // Generate title and description
    const title = generateActivityTitle(prompt);
    const description = generateActivityDescription(prompt);
    const duration = estimateDuration(prompt);
    const materials = generateMaterialsList(prompt);

    const activity = await prisma.generatedActivity.create({
      data: {
        userId: user.id,
        title,
        description,
        activityType,
        plan: generatedPlan.content,
        materials: JSON.stringify(materials),
        duration,
        isPublic: false,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error generating activity:", error);
    return NextResponse.json(
      { error: "Failed to generate activity" },
      { status: 500 }
    );
  }
}

function determineActivityType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("art") || lowerPrompt.includes("creative") || lowerPrompt.includes("drawing")) {
return "art_project";
}
  if (lowerPrompt.includes("story") || lowerPrompt.includes("narrative") || lowerPrompt.includes("writing")) {
return "storytelling";
}
  if (lowerPrompt.includes("hunt") || lowerPrompt.includes("search") || lowerPrompt.includes("find")) {
return "scavenger_hunt";
}
  if (lowerPrompt.includes("workshop") || lowerPrompt.includes("learning") || lowerPrompt.includes("skill")) {
return "workshop";
}
  if (lowerPrompt.includes("cook") || lowerPrompt.includes("food") || lowerPrompt.includes("recipe")) {
return "cooking";
}
  if (lowerPrompt.includes("exercise") || lowerPrompt.includes("fitness") || lowerPrompt.includes("movement")) {
return "exercise";
}

  return "workshop";
}

function generateActivityTitle(prompt: string): string {
  const words = prompt.split(" ").slice(0, 4);
  return words.join(" ").replace(/[^a-zA-Z0-9\s]/g, "") + " Activity";
}

function generateActivityDescription(prompt: string): string {
  return `An engaging activity created based on: "${prompt}". This activity is designed to be fun, educational, and suitable for groups.`;
}

function estimateDuration(prompt: string): number {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("quick") || lowerPrompt.includes("short")) {
return 15;
}
  if (lowerPrompt.includes("long") || lowerPrompt.includes("extended")) {
return 120;
}
  if (lowerPrompt.includes("workshop") || lowerPrompt.includes("session")) {
return 90;
}

  return 60; // Default 1 hour
}

function generateMaterialsList(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  const materials: string[] = [];

  if (lowerPrompt.includes("art") || lowerPrompt.includes("creative")) {
    materials.push("Paper", "Markers", "Crayons", "Scissors", "Glue");
  }
  if (lowerPrompt.includes("story") || lowerPrompt.includes("writing")) {
    materials.push("Notebook", "Pens", "Story prompts");
  }
  if (lowerPrompt.includes("hunt") || lowerPrompt.includes("search")) {
    materials.push("List of items", "Timer", "Prizes");
  }
  if (lowerPrompt.includes("workshop")) {
    materials.push("Handouts", "Projector", "Whiteboard");
  }

  if (materials.length === 0) {
    materials.push("Basic supplies", "Enthusiasm", "Creativity");
  }

  return materials;
}
