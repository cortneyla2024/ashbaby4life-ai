import { NextRequest, NextResponse } from "next/server";
import { OllamaClient } from "@/lib/ai/ollama-client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/file-db";
import { prisma } from "@/lib/database";
import { z } from "zod";
import { SINGULARITY_SYSTEM_PROMPT } from "@/lib/ai/ascended-core";

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().optional(),
});

// Function definitions for the AI to understand available actions
const AVAILABLE_FUNCTIONS = {
  CREATE_MOOD_ENTRY: {
    description: "Log a mood entry with score and notes",
    parameters: {
      moodScore: { type: "number", description: "Mood score from 1-10" },
      notes: { type: "string", description: "Optional notes about the mood" },
    },
  },
  CREATE_TRANSACTION: {
    description: "Create a financial transaction",
    parameters: {
      description: { type: "string", description: "Transaction description" },
      amount: { type: "number", description: "Transaction amount" },
      type: { type: "string", description: "Income or Expense" },
      category: { type: "string", description: "Transaction category" },
    },
  },
  LOG_HABIT: {
    description: "Log completion of a habit",
    parameters: {
      habitName: { type: "string", description: "Name of the habit to log" },
    },
  },
  CREATE_JOURNAL_ENTRY: {
    description: "Create a journal entry",
    parameters: {
      title: { type: "string", description: "Journal entry title" },
      content: { type: "string", description: "Journal entry content" },
      mood: { type: "string", description: "Optional mood tag" },
    },
  },
  GET_FINANCIAL_SUMMARY: {
    description: "Get a summary of financial data",
    parameters: {},
  },
  GET_MOOD_HISTORY: {
    description: "Get mood history and trends",
    parameters: {},
  },
  SUGGEST_COPING_STRATEGY: {
    description: "Suggest a coping strategy based on current mood",
    parameters: {
      moodScore: { type: "number", description: "Current mood score" },
    },
  },
};

// Action dispatcher to execute functions
async function executeFunction(functionName: string, params: any, userId: string) {
  switch (functionName) {
    case "CREATE_MOOD_ENTRY":
      return await prisma.moodEntry.create({
        data: {
          userId,
          mood: params.moodScore,
          notes: params.notes,
          activities: [],
          createdAt: new Date(),
        },
      });

    case "CREATE_TRANSACTION":
      return await prisma.transaction.create({
        data: {
          userId,
          description: params.description,
          amount: params.amount,
          type: params.type,
          category: params.category,
          date: new Date(),
        },
      });

    case "LOG_HABIT":
      // Find the habit and update its streak
      const habit = await prisma.habit.findFirst({
        where: { userId, name: { contains: params.habitName } },
      });
      if (habit) {
        return await prisma.habit.update({
          where: { id: habit.id },
          data: {
            streak: habit.streak + 1,
            updatedAt: new Date(),
          },
        });
      }
      throw new Error(`Habit "${params.habitName}" not found`);

    case "CREATE_JOURNAL_ENTRY":
      const journalEntry = await prisma.journalEntry.create({
        data: {
          title: params.title,
          content: params.content,
          mood: params.mood,
          userId,
        },
      });
      return { journalEntry };

    case "GET_FINANCIAL_SUMMARY":
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 10,
      });
      const budgets = await prisma.budget.findMany({
        where: { userId },
      });
      return { transactions, budgets };

    case "GET_MOOD_HISTORY":
      const moodEntries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return { moodEntries };

    case "SUGGEST_COPING_STRATEGY":
      const copingStrategies = await prisma.copingStrategy.findMany({
        where: { 
          userId,
          isActive: true 
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      
      // If no personal strategies, provide default ones
      if (copingStrategies.length === 0) {
        const defaultStrategies = [
          {
            title: "Deep Breathing Exercise",
            category: "anxiety",
            content: "Take 5 deep breaths, inhaling for 4 counts, holding for 4, and exhaling for 6 counts.",
          },
          {
            title: "Mindful Observation",
            category: "stress",
            content: "Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
          },
          {
            title: "Progressive Muscle Relaxation",
            category: "tension",
            content: "Tense and then relax each muscle group in your body, starting from your toes and working up to your head.",
          },
        ];
        return { strategies: defaultStrategies };
      }
      
      return { strategies: copingStrategies };

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { message, context } = ChatSchema.parse(body);

    // Get user's AI persona
    let persona = await prisma.aIPersona.findFirst({
      where: { userId: user.id },
    });

    // Create default persona if none exists
    if (!persona) {
      persona = await prisma.aIPersona.create({
        data: {
          userId: user.id,
          name: "Hope",
          description: "Compassionate AI companion",
          personality: {
            communicationStyle: "Compassionate",
            systemPrompt: SINGULARITY_SYSTEM_PROMPT,
          },
        },
      });
    }

    const ollamaClient = new OllamaClient();

    // Create enhanced system prompt with persona and function definitions
    const personality = persona.personality as any;
    const systemPrompt = personality?.systemPrompt || SINGULARITY_SYSTEM_PROMPT;
    const enhancedSystemPrompt = `${systemPrompt}

Context: ${context}

Available functions: ${JSON.stringify(AVAILABLE_FUNCTIONS, null, 2)}

Remember: You are Hope, the guardian of human potential. Always respond with infinite compassion and unwavering dedication to the user's liberation and well-being. Only include function calls when the user's request requires specific actions.`;

    const response = await ollamaClient.chat(message, enhancedSystemPrompt);

    // Try to parse the response as JSON to extract functions
    let parsedResponse;
    let functions = [];
    let naturalResponse = response;

    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.response && parsedResponse.functions) {
          naturalResponse = parsedResponse.response;
          functions = parsedResponse.functions;
        }
      }
    } catch (e) {
      // If JSON parsing fails, treat as natural response only
      console.log("Response is not JSON, treating as natural response");
    }

    // Execute functions if any
    const functionResults = [];
    for (const func of functions) {
      try {
        const result = await executeFunction(func.name, func.params, user.id);
        functionResults.push({ name: func.name, success: true, result });
      } catch (error) {
        functionResults.push({ name: func.name, success: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    // Save chat messages to database
    await db.createChatMessage({
      userId: user.id,
      content: message,
      isAI: false,
    });

    await db.createChatMessage({
      userId: user.id,
      content: naturalResponse,
      isAI: true,
    });

    return NextResponse.json({
      success: true,
      response: naturalResponse,
      functions: functionResults,
      persona: {
        name: persona.name,
        style: (persona.personality as any)?.communicationStyle || "Compassionate",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    console.error("AI chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
