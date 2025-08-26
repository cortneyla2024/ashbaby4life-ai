import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { z } from "zod";

const PersonaSchema = z.object({
  personaName: z.string().min(1).max(50),
  communicationStyle: z.enum(["Empathetic", "Direct", "Humorous", "Balanced", "Professional"]),
  voiceProfile: z.string().optional(),
  systemPrompt: z.string().min(10).max(2000),
});

export async function GET(_request: NextRequest) {
  try {
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

    const persona = await prisma.aIPersona.findFirst({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      persona: persona || null,
    });
  } catch (error) {
    console.error("Get persona error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get persona" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { personaName, communicationStyle, voiceProfile, systemPrompt } = PersonaSchema.parse(body);

    // Find existing persona or create new one
    let persona = await prisma.aIPersona.findFirst({
      where: { userId: user.id },
    });

    if (persona) {
      // Update existing persona
      persona = await prisma.aIPersona.update({
        where: { id: persona.id },
        data: {
          name: personaName,
          description: communicationStyle,
          personality: {
            communicationStyle,
            systemPrompt,
            ...(voiceProfile && { voiceProfile }),
          },
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new persona
      persona = await prisma.aIPersona.create({
        data: {
          userId: user.id,
          name: personaName,
          description: communicationStyle,
          personality: {
            communicationStyle,
            systemPrompt,
            ...(voiceProfile && { voiceProfile }),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      persona,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    console.error("Update persona error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update persona" },
      { status: 500 }
    );
  }
}
