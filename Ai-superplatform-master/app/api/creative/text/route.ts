import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { OllamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();
const ollama = new OllamaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, projectId } = await request.json();
    if (!prompt || !projectId) {
      return NextResponse.json({ error: "Prompt and projectId are required" }, { status: 400 });
    }

    // Verify the project exists and belongs to the user
    const project = await prisma.creativeProject.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate creative text using Ollama
    const creativePrompt = `You are a creative writing assistant. Please create a creative piece based on this prompt: "${prompt}". 
    The response should be engaging, imaginative, and well-crafted. It could be a short story, poem, character description, 
    or any other creative text that fits the prompt. Make it inspiring and original.`;

    const generatedText = await ollama.generateText(creativePrompt, 1000);

    // Create the generated asset
    const asset = await prisma.generatedAsset.create({
      data: {
        projectId,
        type: "TEXT",
        prompt,
        content: generatedText,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({
      asset,
      message: "Creative text generated successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
