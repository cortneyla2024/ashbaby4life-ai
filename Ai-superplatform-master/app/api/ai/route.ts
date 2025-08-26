import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await AuthService.authenticate(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { prompt, history = [], context = "" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid prompt is required" },
        { status: 400 }
      );
    }

    const OLLAMA_URL = process.env.OLLAMA_API_BASE_URL || "http://localhost:11434";
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

    // Prepare the conversation history
    const messages = [
      {
        role: "system",
        content: `You are an AI Life Companion - a supportive, empathetic, and knowledgeable assistant designed to help users with their personal growth, goals, health, and overall well-being. You have access to universal knowledge and provide thoughtful, caring responses. Always be encouraging, understanding, and helpful while maintaining appropriate boundaries.

Key traits:
- Empathetic and supportive
- Knowledgeable about health, psychology, productivity, and personal development
- Encouraging and motivating
- Respectful of privacy and boundaries
- Focused on the user's well-being and growth

Context: ${context}`,
      },
      ...history.map((msg: any) => ({
        role: msg.role || "user",
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    // Call Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.message?.content || "I apologize, but I encountered an error processing your request.";

    return NextResponse.json({
      success: true,
      response: aiResponse,
      model: OLLAMA_MODEL,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to the local AI model. Please ensure Ollama is running.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
