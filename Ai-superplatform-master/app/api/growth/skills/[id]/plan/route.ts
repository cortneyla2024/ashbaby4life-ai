import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OllamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();
const ollama = new OllamaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skillId = params.id;

    // Get the skill details
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        resources: true,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Generate AI learning plan
    const prompt = `Create a detailed, step-by-step learning plan for mastering "${skill.name}". 
    
    Current mastery level: ${skill.masteryLevel}/100
    
    The plan should include:
    1. Foundation concepts to learn
    2. Practical exercises and projects
    3. Recommended learning resources
    4. Milestones and progress indicators
    5. Time estimates for each phase
    6. Tips for effective learning
    
    Make the plan personalized and actionable. Format it clearly with sections and bullet points.`;

    const aiLearningPlan = await ollama.generateText(prompt, 1000);

    // Update the skill with the AI-generated plan
    const updatedSkill = await prisma.skill.update({
      where: { id: skillId },
      data: { aiLearningPlan },
      include: {
        resources: true,
      },
    });

    return NextResponse.json({
      skill: updatedSkill,
      message: "AI learning plan generated successfully",
    });
  } catch (error) {
    console.error("Error generating learning plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
