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

    const resourceId = params.id;

    // Get the resource details
    const resource = await prisma.learningResource.findUnique({
      where: { id: resourceId },
      include: {
        skill: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (!resource.url) {
      return NextResponse.json({ error: "Resource has no URL to summarize" }, { status: 400 });
    }

    // Fetch content from URL (simplified - in production you'd want more robust content extraction)
    let content = "";
    try {
      const response = await fetch(resource.url);
      if (response.ok) {
        const text = await response.text();
        // Simple content extraction - in production you'd use a proper HTML parser
        content = text.substring(0, 2000); // Limit content length
      }
    } catch (error) {
      console.error("Error fetching resource content:", error);
      content = resource.notes || resource.title; // Fallback to notes or title
    }

    // Generate AI summary
    const prompt = `Please provide a concise summary of the following learning resource:

Title: ${resource.title}
Type: ${resource.type}
Content: ${content}

Please create a summary that includes:
1. Key concepts and main points
2. Practical applications or takeaways
3. Difficulty level and prerequisites
4. Estimated time to complete

Format the summary clearly with sections and bullet points.`;

    const aiSummary = await ollama.generateText(prompt, 800);

    // Update the resource with the AI-generated summary
    const updatedResource = await prisma.learningResource.update({
      where: { id: resourceId },
      data: { aiSummary },
      include: {
        skill: true,
      },
    });

    return NextResponse.json({
      resource: updatedResource,
      message: "AI summary generated successfully",
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
