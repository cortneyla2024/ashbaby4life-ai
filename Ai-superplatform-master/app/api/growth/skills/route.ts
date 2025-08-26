import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// const ollama = new OllamaClient(); // Unused for now

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you'd verify the token and get the user ID
    // For now, we'll use a placeholder user ID
    const userId = "user123"; // This should come from token verification

    const skills = await prisma.skill.findMany({
      where: { userId },
      include: {
        resources: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, masteryLevel = 0 } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    const userId = "user123"; // This should come from token verification

    const skill = await prisma.skill.create({
      data: {
        userId,
        name,
        masteryLevel,
      },
      include: {
        resources: true,
      },
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
