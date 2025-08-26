import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skillId, title, url, notes, type } = await request.json();

    if (!skillId || !title) {
      return NextResponse.json({ error: "Skill ID and title are required" }, { status: 400 });
    }

    const userId = "user123"; // This should come from token verification

    // Verify the skill exists and belongs to the user
    const skill = await prisma.skill.findUnique({
      where: { id: skillId, userId },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const resource = await prisma.learningResource.create({
      data: {
        userId,
        skillId,
        title,
        url: url || null,
        notes: notes || null,
        type: type || "ARTICLE",
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
