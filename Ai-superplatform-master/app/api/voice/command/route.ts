import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ollamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();

// Authenticate user by bearer token
async function authenticateUser(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Find all API tokens and compare with the provided token
    const apiTokens = await prisma.userAPIToken.findMany();

    for (const apiToken of apiTokens) {
      const isValid = await bcrypt.compare(token, apiToken.tokenHash);
      if (isValid) {
        // Update last used timestamp
        await prisma.userAPIToken.update({
          where: { id: apiToken.id },
          data: { lastUsedAt: new Date() },
        });
        return apiToken.userId;
      }
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// AI Intent Recognition
async function recognizeIntent(transcribedText: string): Promise<{ intent: string; payload: any }> {
  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `You are an intent recognition engine for the AI Life Companion. Your task is to analyze the user's text and convert it into a structured JSON command.

The possible intents are:
- CREATE_TRANSACTION (requires: description, amount, type, category)
- LOG_HABIT (requires: name, date)
- CREATE_JOURNAL_ENTRY (requires: content)
- ADD_LEARNING_RESOURCE (requires: skillName, title, url)

Analyze the following text:
"${transcribedText}"

Today's date is ${currentDate}.

Return ONLY the JSON object. Do not add any other text or explanation.`;

  try {
    const response = await ollamaClient.chat({
      model: "llama3.2",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.message?.content || "";

    // Try to parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }

    // Fallback: try to extract intent from the response
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("transaction") || lowerContent.includes("expense") || lowerContent.includes("income")) {
      return {
        intent: "CREATE_TRANSACTION",
        payload: { description: transcribedText, amount: 0, type: "Expense", category: "Other" },
      };
    } else if (lowerContent.includes("habit") || lowerContent.includes("log")) {
      return {
        intent: "LOG_HABIT",
        payload: { name: "general", date: currentDate },
      };
    } else if (lowerContent.includes("journal") || lowerContent.includes("entry")) {
      return {
        intent: "CREATE_JOURNAL_ENTRY",
        payload: { content: transcribedText },
      };
    } else {
      return {
        intent: "CREATE_JOURNAL_ENTRY",
        payload: { content: transcribedText },
      };
    }
  } catch (error) {
    console.error("AI intent recognition error:", error);
    // Default fallback
    return {
      intent: "CREATE_JOURNAL_ENTRY",
      payload: { content: transcribedText },
    };
  }
}

// Action Dispatcher
async function executeAction(userId: string, intent: string, payload: any): Promise<{ success: boolean; message: string }> {
  try {
    switch (intent) {
      case "CREATE_TRANSACTION":
        const transaction = await prisma.transaction.create({
          data: {
            userId: userId,
            description: payload.description,
            amount: parseFloat(payload.amount) || 0,
            type: payload.type || "Expense",
            category: payload.category || "Other",
            date: new Date(),
          },
        });
        return {
          success: true,
          message: `Successfully created transaction: ${payload.description} for $${payload.amount}`,
        };

      case "LOG_HABIT":
        // Find or create habit
        let habit = await prisma.habit.findFirst({
          where: {
            userId: userId,
            name: { contains: payload.name, mode: "insensitive" },
          },
        });

        if (!habit) {
          habit = await prisma.habit.create({
            data: {
              userId: userId,
              name: payload.name,
              frequency: "Daily",
              goal: "Track daily progress",
            },
          });
        }

        // Log the habit
        const habitDate = payload.date ? new Date(payload.date) : new Date();
        await prisma.habitLog.upsert({
          where: {
            habitId_date: {
              habitId: habit.id,
              date: habitDate,
            },
          },
          update: {
            isCompleted: true,
          },
          create: {
            habitId: habit.id,
            date: habitDate,
            isCompleted: true,
          },
        });

        return {
          success: true,
          message: `Successfully logged habit: ${payload.name} for ${payload.date || "today"}`,
        };

      case "CREATE_JOURNAL_ENTRY":
        const journalEntry = await prisma.journalEntry.create({
          data: {
            userId: userId,
            content: payload.content,
            title: `Voice Entry - ${new Date().toLocaleDateString()}`,
            tags: ["voice-entry"],
          },
        });
        return {
          success: true,
          message: `Successfully created journal entry: ${payload.content.substring(0, 50)}...`,
        };

      case "ADD_LEARNING_RESOURCE":
        // Find or create skill
        let skill = await prisma.skill.findFirst({
          where: {
            userId: userId,
            name: { contains: payload.skillName, mode: "insensitive" },
          },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              userId: userId,
              name: payload.skillName,
              masteryLevel: 0,
            },
          });
        }

        // Add learning resource
        await prisma.learningResource.create({
          data: {
            skillId: skill.id,
            title: payload.title,
            url: payload.url,
            type: "ARTICLE",
          },
        });

        return {
          success: true,
          message: `Successfully added learning resource: ${payload.title} for ${payload.skillName}`,
        };

      default:
        return {
          success: false,
          message: `Unknown intent: ${intent}`,
        };
    }
  } catch (error) {
    console.error("Action execution error:", error);
    return {
      success: false,
      message: `Failed to execute action: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get("authorization");
    const userId = await authenticateUser(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Invalid or missing API token" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { transcribedText } = body;

    if (!transcribedText) {
      return NextResponse.json({ error: "Missing transcribedText" }, { status: 400 });
    }

    // Recognize intent using AI
    const { intent, payload } = await recognizeIntent(transcribedText);

    // Execute the action
    const result = await executeAction(userId, intent, payload);

    // Log the command
    await prisma.voiceCommandLog.create({
      data: {
        userId: userId,
        transcribedText: transcribedText,
        recognizedIntent: intent,
        payload: payload,
        status: result.success ? "SUCCESS" : "FAILED",
        responseMessage: result.message,
      },
    });

    return NextResponse.json({
      message: result.message,
      intent: intent,
      success: result.success,
    });

  } catch (error) {
    console.error("Voice command error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
