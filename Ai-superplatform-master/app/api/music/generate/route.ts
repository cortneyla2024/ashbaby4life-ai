import { NextRequest, NextResponse } from "next/server";
import { MusicClient } from "@/lib/ai/music-client";
import { db } from "@/lib/db/file-db";
import { z } from "zod";

const MusicGenerationSchema = z.object({
  prompt: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // For now, use a placeholder user ID since AuthService.authenticate returns null
    const userId = "user123";

    const body = await request.json();
    const { prompt } = MusicGenerationSchema.parse(body);

    const musicClient = new MusicClient();
    const composition = await musicClient.generateComposition(prompt);

    // Save composition to database
    await db.createSong({
      userId,
      title: composition.title,
      prompt,
      composition,
    });

    return NextResponse.json({
      success: true,
      composition,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    console.error("Music generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate music" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "random") {
      // Generate random composition
      const musicClient = new MusicClient();
      const composition = await musicClient.generateComposition("random composition");

      return NextResponse.json({
        success: true,
        composition,
        action: "random",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "options") {
      // Get valid music options
      const musicClient = new MusicClient();
      const options = musicClient.getValidOptions();

      return NextResponse.json({
        success: true,
        options,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Music API error:", error);
    return NextResponse.json(
      { error: "Music API request failed" },
      { status: 500 }
    );
  }
}
