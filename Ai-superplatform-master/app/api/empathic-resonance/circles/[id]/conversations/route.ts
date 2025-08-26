import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/database";
import { generateAIResponse } from "@/lib/ai";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify user is a member of the circle
    const circle = await prisma.familyCircle.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const conversations = await prisma.guidedConversation.findMany({
      where: {
        circleId: params.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify user is a member of the circle
    const circle = await prisma.familyCircle.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    const { topic } = await request.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Generate AI moderator script
    const aiModeratorPrompt = `Create a guided conversation script for a family circle discussion about "${topic}". 
    The script should be compassionate, inclusive, and help family members understand each other's perspectives. 
    Include opening questions, discussion points, and closing reflections.`;

    const aiModerator = await generateAIResponse(aiModeratorPrompt, {
      userId: "system",
      conversationHistory: [],
      module: "empathic-resonance",
    });

    const conversation = await prisma.guidedConversation.create({
      data: {
        circleId: params.id,
        title: `Guided Conversation: ${topic.trim()}`,
        topic: topic.trim(),
        aiModerator: aiModerator.content,
        status: "active",
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
