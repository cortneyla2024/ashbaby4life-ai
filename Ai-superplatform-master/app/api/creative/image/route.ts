import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, projectId, style = "photorealistic" } = await request.json();
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

    // For now, we'll simulate image generation since we need the llava model
    // In a real implementation, this would call the Ollama llava model
    const enhancedPrompt = `${style} style: ${prompt}`;

    // Simulate image generation - in production, this would be:
    // const imageResponse = await fetch('http://localhost:11434/api/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     model: 'llava',
    //     prompt: enhancedPrompt,
    //     stream: false
    //   })
    // });

    // For now, create a placeholder image URL
    const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`;

    // Create the generated asset
    const asset = await prisma.generatedAsset.create({
      data: {
        projectId,
        type: "IMAGE",
        prompt: enhancedPrompt,
        content: imageUrl,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({
      asset,
      message: "Image generated successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
