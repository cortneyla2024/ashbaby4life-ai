import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
;
import { generateAIResponse } from "../../../../lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goal } = body;

    if (!goal) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 }
      );
    }

    // Create a prompt for the AI to suggest automation routines
    const prompt = `Based on this goal: "${goal}", suggest an automation routine that could help achieve it.

Please respond with a JSON object in this exact format:
{
  "name": "Descriptive name for the automation",
  "description": "Brief description of what this automation does",
  "triggers": [
    {
      "type": "TRIGGER_TYPE",
      "params": { "param1": "value1" }
    }
  ],
  "actions": [
    {
      "type": "ACTION_TYPE", 
      "params": { "param1": "value1" }
    }
  ]
}

Available trigger types:
- MOOD_BELOW_THRESHOLD: params: { "threshold": number }
- HABIT_COMPLETED: params: { "habitName": "string" }
- HABIT_MISSED: params: { "habitName": "string" }
- TRANSACTION_CREATED: params: { "category": "string", "minAmount": number, "maxAmount": number }
- BUDGET_EXCEEDED: params: { "budgetName": "string" }
- GOAL_COMPLETED: params: { "category": "string" }
- JOURNAL_CREATED: params: {}
- ASSESSMENT_COMPLETED: params: { "assessmentType": "string" }
- SCHEDULED_TIME: params: { "cron": "string" }

Available action types:
- CREATE_JOURNAL_PROMPT: params: { "prompt": "string" }
- SUGGEST_COPING_STRATEGY: params: { "category": "string" }
- CREATE_TRANSACTION: params: { "description": "string", "amount": number, "category": "string", "type": "Income|Expense" }
- CREATE_GOAL: params: { "title": "string", "description": "string", "category": "string", "targetDate": "string" }
- SEND_NOTIFICATION: params: { "message": "string", "priority": "LOW|MEDIUM|HIGH" }
- GENERATE_AI_INSIGHT: params: { "prompt": "string", "context": "string" }
- CREATE_HABIT_REMINDER: params: { "habitName": "string", "message": "string" }
- ANALYZE_SPENDING_PATTERN: params: {}
- SUGGEST_ACTIVITY: params: { "mood": number, "timeOfDay": "morning|afternoon|evening" }
- CREATE_MOOD_CHECK_IN: params: { "prompt": "string" }

Make the suggestion practical and specific to the goal. Only respond with valid JSON.`;

    try {
      const aiResponse = await generateAIResponse(prompt, {
        userId: session.user.id || "unknown",
        conversationHistory: [],
        module: "automation",
      });

      // Try to parse the JSON response
      let suggestion;
      try {
        suggestion = JSON.parse(aiResponse.content);
      } catch (parseError) {
        // If the AI didn't return valid JSON, create a fallback suggestion
        suggestion = {
          name: `Automation for: ${goal}`,
          description: `An automation routine to help with: ${goal}`,
          triggers: [
            {
              type: "SCHEDULED_TIME",
              params: { "cron": "0 9 * * 1" }, // Every Monday at 9 AM
            },
          ],
          actions: [
            {
              type: "SEND_NOTIFICATION",
              params: {
                message: `Time to work on your goal: ${goal}`,
                priority: "MEDIUM",
              },
            },
          ],
        };
      }

      return NextResponse.json({ suggestion });
    } catch (aiError) {
      console.error("Error generating AI suggestion:", aiError);

      // Return a fallback suggestion
      const fallbackSuggestion = {
        name: `Automation for: ${goal}`,
        description: `An automation routine to help with: ${goal}`,
        triggers: [
          {
            type: "SCHEDULED_TIME",
            params: { "cron": "0 9 * * 1" }, // Every Monday at 9 AM
          },
        ],
        actions: [
          {
            type: "SEND_NOTIFICATION",
            params: {
              message: `Time to work on your goal: ${goal}`,
              priority: "MEDIUM",
            },
          },
        ],
      };

      return NextResponse.json({ suggestion: fallbackSuggestion });
    }
  } catch (error) {
    console.error("Error in automation suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate automation suggestion" },
      { status: 500 }
    );
  }
}
