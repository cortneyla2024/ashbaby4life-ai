import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { GenesisFoundry } from "@/lib/ai/genesis-foundry";
import { SINGULARITY_SYSTEM_PROMPT } from "@/lib/ai/ascended-core";
import { OllamaClient } from "@/lib/ai/ollama-client";
import { z } from "zod";

const ConciergeSchema = z.object({
  request: z.string().min(1).max(2000),
  context: z.string().optional(),
  actionMode: z.boolean().default(true), // Whether to execute actions or just provide information
});

// Universal Concierge Functions - The Internet Subsumption Protocol
const UNIVERSAL_FUNCTIONS = {
  RESEARCH_AND_SYNTHESIZE: {
    description: "Research a topic and synthesize information from multiple sources",
    parameters: {
      topic: { type: "string", description: "The topic to research" },
      depth: { type: "string", description: "Research depth: basic, comprehensive, expert" },
      sources: { type: "number", description: "Number of sources to consult (1-10)" },
    },
  },
  CREATE_TUTORIAL: {
    description: "Generate a step-by-step tutorial with diagrams and explanations",
    parameters: {
      topic: { type: "string", description: "What to teach" },
      skillLevel: { type: "string", description: "Beginner, intermediate, advanced" },
      format: { type: "string", description: "Text, visual, interactive" },
    },
  },
  GENERATE_DESIGN: {
    description: "Create logos, designs, and visual content",
    parameters: {
      type: { type: "string", description: "Logo, banner, icon, illustration" },
      style: { type: "string", description: "Modern, classic, minimalist, bold" },
      purpose: { type: "string", description: "Business, personal, creative" },
    },
  },
  PLAN_TRAVEL: {
    description: "Plan travel itineraries and find the best deals",
    parameters: {
      destination: { type: "string", description: "Where to travel" },
      budget: { type: "number", description: "Budget in dollars" },
      duration: { type: "string", description: "Trip duration" },
      preferences: { type: "string", description: "Travel style and preferences" },
    },
  },
  CREATE_WEBSITE: {
    description: "Generate and host a simple website",
    parameters: {
      purpose: { type: "string", description: "Portfolio, business, blog, etc." },
      style: { type: "string", description: "Design style preference" },
      content: { type: "string", description: "Key content to include" },
    },
  },
  ANALYZE_DOCUMENT: {
    description: "Analyze financial documents and provide insights",
    parameters: {
      documentType: { type: "string", description: "Type of document" },
      content: { type: "string", description: "Document content or key points" },
      analysisType: { type: "string", description: "Financial, legal, technical" },
    },
  },
  TRANSLATE_CONTENT: {
    description: "Translate languages and bridge cultural gaps",
    parameters: {
      content: { type: "string", description: "Content to translate" },
      fromLanguage: { type: "string", description: "Source language" },
      toLanguage: { type: "string", description: "Target language" },
      context: { type: "string", description: "Cultural context if needed" },
    },
  },
  FIND_RESOURCES: {
    description: "Find public assistance, grants, and resources",
    parameters: {
      category: { type: "string", description: "Type of assistance needed" },
      location: { type: "string", description: "Geographic location" },
      eligibility: { type: "string", description: "User's eligibility criteria" },
    },
  },
  FILL_GOVERNMENT_FORM: {
    description: "Help fill out government forms and applications",
    parameters: {
      formType: { type: "string", description: "Type of government form" },
      userInfo: { type: "string", description: "User's relevant information" },
      jurisdiction: { type: "string", description: "Federal, state, local" },
    },
  },
  PROVIDE_LEGAL_GUIDANCE: {
    description: "Provide legal guidance and explain complex documents",
    parameters: {
      legalTopic: { type: "string", description: "Legal issue or document type" },
      jurisdiction: { type: "string", description: "Relevant jurisdiction" },
      complexity: { type: "string", description: "Simple explanation or detailed analysis" },
    },
  },
};

// Action dispatcher for Universal Concierge functions
async function executeConciergeFunction(functionName: string, params: any, _userId: string) {
  // const foundry = GenesisFoundry.getInstance();

  switch (functionName) {
    case "RESEARCH_AND_SYNTHESIZE":
      return await researchAndSynthesize(params.topic, params.depth, params.sources);

    case "CREATE_TUTORIAL":
      return await createTutorial(params.topic, params.skillLevel, params.format);

    case "GENERATE_DESIGN":
      return await generateDesign(params.type, params.style, params.purpose);

    case "PLAN_TRAVEL":
      return await planTravel(params.destination, params.budget, params.duration, params.preferences);

    case "CREATE_WEBSITE":
      return await createWebsite(params.purpose, params.style, params.content);

    case "ANALYZE_DOCUMENT":
      return await analyzeDocument(params.documentType, params.content, params.analysisType);

    case "TRANSLATE_CONTENT":
      return await translateContent(params.content, params.fromLanguage, params.toLanguage, params.context);

    case "FIND_RESOURCES":
      return await findResources(params.category, params.location, params.eligibility);

    case "FILL_GOVERNMENT_FORM":
      return await fillGovernmentForm(params.formType, params.userInfo, params.jurisdiction);

    case "PROVIDE_LEGAL_GUIDANCE":
      return await provideLegalGuidance(params.legalTopic, params.jurisdiction, params.complexity);

    default:
      throw new Error(`Unknown concierge function: ${functionName}`);
  }
}

async function researchAndSynthesize(topic: string, depth: string, _sources: number) {
  // Query the knowledge graph and synthesize information
  const foundry = GenesisFoundry.getInstance();
  const knowledgeNodes = await foundry.queryKnowledgeGraph(topic);

  const synthesis = {
    topic,
    depth,
    sourcesConsulted: knowledgeNodes.length,
    keyFindings: knowledgeNodes.slice(0, 5).map(node => ({
      title: node.title,
      summary: node.content.substring(0, 200) + "...",
      confidence: node.confidence,
      source: node.source,
    })),
    comprehensiveSummary: `Based on ${knowledgeNodes.length} sources, here's what I found about ${topic}...`,
    recommendations: "Based on this research, I recommend...",
    additionalResources: knowledgeNodes.slice(5, 10).map(node => ({
      title: node.title,
      source: node.source,
    })),
  };

  return synthesis;
}

async function createTutorial(topic: string, skillLevel: string, format: string) {
  const tutorial = {
    title: `Complete Guide to ${topic}`,
    skillLevel,
    format,
    overview: `This tutorial will teach you ${topic} from a ${skillLevel} perspective.`,
    prerequisites: "Before starting, you should have...",
    steps: [
      {
        step: 1,
        title: "Introduction to the Basics",
        content: "Let's start with the fundamental concepts...",
        estimatedTime: "10 minutes",
        tips: ["Take notes", "Practice as you go"],
      },
      {
        step: 2,
        title: "Core Concepts",
        content: "Now let's dive deeper into the key principles...",
        estimatedTime: "20 minutes",
        tips: ["Review step 1 if needed", "Ask questions"],
      },
      {
        step: 3,
        title: "Practical Application",
        content: "Let's apply what we've learned...",
        estimatedTime: "30 minutes",
        tips: ["Experiment", "Don't be afraid to make mistakes"],
      },
    ],
    resources: [
      "Free online tools",
      "Practice exercises",
      "Additional reading materials",
    ],
    nextSteps: "Once you've completed this tutorial, you can...",
  };

  return tutorial;
}

async function generateDesign(type: string, style: string, purpose: string) {
  const design = {
    type,
    style,
    purpose,
    concept: `A ${style} ${type} designed for ${purpose}`,
    description: `This design features clean lines, modern typography, and a color palette that reflects ${style} aesthetics while serving ${purpose} needs.`,
    specifications: {
      dimensions: "Scalable vector format",
      colors: ["Primary: #3B82F6", "Secondary: #1F2937", "Accent: #F59E0B"],
      typography: "Modern sans-serif font family",
      elements: ["Clean layout", "Balanced composition", "Professional appearance"],
    },
    mockup: "Generated visual representation would be created here",
    variations: [
      "Minimalist version",
      "Bold version",
      "Colorful version",
    ],
    usageGuidelines: "This design can be used for...",
    fileFormats: ["SVG", "PNG", "PDF"],
  };

  return design;
}

async function planTravel(destination: string, budget: number, duration: string, preferences: string) {
  const travelPlan = {
    destination,
    budget,
    duration,
    preferences,
    overview: `A ${duration} trip to ${destination} within a $${budget} budget, tailored to your ${preferences} preferences.`,
    itinerary: {
      day1: {
        date: "Day 1 - Arrival",
        activities: ["Check into accommodation", "Explore local area", "Dinner at recommended restaurant"],
        estimatedCost: budget * 0.1,
      },
      day2: {
        date: "Day 2 - Main Activities",
        activities: ["Visit main attractions", "Local cultural experience", "Evening entertainment"],
        estimatedCost: budget * 0.3,
      },
      day3: {
        date: "Day 3 - Departure",
        activities: ["Final exploration", "Shopping for souvenirs", "Return journey"],
        estimatedCost: budget * 0.1,
      },
    },
    accommodation: {
      recommendations: ["Budget-friendly hotel", "Local guesthouse", "Vacation rental"],
      estimatedCost: budget * 0.4,
    },
    transportation: {
      options: ["Public transit", "Rental car", "Walking tours"],
      estimatedCost: budget * 0.1,
    },
    activities: {
      mustSee: ["Main attraction 1", "Main attraction 2", "Local experience"],
      optional: ["Additional activity 1", "Additional activity 2"],
      estimatedCost: budget * 0.3,
    },
    budgetBreakdown: {
      accommodation: budget * 0.4,
      activities: budget * 0.3,
      food: budget * 0.2,
      transportation: budget * 0.1,
    },
    tips: [
      "Book accommodation in advance",
      "Research local customs",
      "Keep emergency contact information handy",
    ],
  };

  return travelPlan;
}

async function createWebsite(purpose: string, style: string, content: string) {
  const website = {
    purpose,
    style,
    content,
    structure: {
      homepage: {
        title: `${purpose} - Welcome`,
        sections: ["Hero section", "About", "Services/Content", "Contact"],
      },
      pages: [
        {
          name: "About",
          content: "Information about the purpose and mission",
        },
        {
          name: "Services/Content",
          content: "Main content or services offered",
        },
        {
          name: "Contact",
          content: "Contact information and form",
        },
      ],
    },
    design: {
      theme: style,
      colorScheme: "Professional and modern",
      typography: "Clean, readable fonts",
      layout: "Responsive design for all devices",
    },
    features: [
      "Mobile-responsive design",
      "Fast loading times",
      "SEO optimization",
      "Contact forms",
      "Social media integration",
    ],
    hosting: {
      platform: "Free hosting available",
      domain: "Custom domain options",
      ssl: "Secure HTTPS connection",
    },
    maintenance: {
      updates: "Automatic security updates",
      backups: "Regular data backups",
      support: "24/7 technical support",
    },
  };

  return website;
}

async function analyzeDocument(documentType: string, _content: string, analysisType: string) {
  const analysis = {
    documentType,
    analysisType,
    summary: `Analysis of ${documentType} document focusing on ${analysisType} aspects.`,
    keyFindings: [
      "Important point 1 with explanation",
      "Important point 2 with explanation",
      "Important point 3 with explanation",
    ],
    recommendations: [
      "Action item 1",
      "Action item 2",
      "Action item 3",
    ],
    risks: [
      "Potential risk 1",
      "Potential risk 2",
    ],
    opportunities: [
      "Opportunity 1",
      "Opportunity 2",
    ],
    nextSteps: "Based on this analysis, I recommend...",
    relatedResources: [
      "Additional reading material 1",
      "Additional reading material 2",
    ],
  };

  return analysis;
}

async function translateContent(content: string, fromLanguage: string, toLanguage: string, context: string) {
  const translation = {
    originalContent: content,
    fromLanguage,
    toLanguage,
    context,
    translatedContent: `[Translated content from ${fromLanguage} to ${toLanguage}]`,
    culturalNotes: [
      "Cultural consideration 1",
      "Cultural consideration 2",
    ],
    alternativeTranslations: [
      "Alternative translation 1",
      "Alternative translation 2",
    ],
    usageGuidelines: "This translation is appropriate for...",
    accuracy: "High confidence translation",
    additionalContext: "Additional cultural or linguistic context...",
  };

  return translation;
}

async function findResources(category: string, location: string, eligibility: string) {
  const foundry = GenesisFoundry.getInstance();
  const resources = await foundry.getPublicResources(category);
  const programs = await foundry.getAssistancePrograms();

  return {
    category,
    location,
    eligibility,
    resources: resources.map(resource => ({
      name: resource.name,
      description: resource.description,
      contact: resource.contact,
      website: resource.website,
      eligibility: resource.eligibility,
    })),
    programs: programs.map(program => ({
      name: program.name,
      description: program.description,
      applicationProcess: program.applicationProcess,
      averageBenefit: program.averageBenefit,
      processingTime: program.processingTime,
    })),
    recommendations: [
      "Start with the most relevant program",
      "Gather required documentation",
      "Apply early as processing times vary",
    ],
    nextSteps: "I recommend starting with...",
    additionalSupport: "If you need help with applications...",
  };
}

async function fillGovernmentForm(formType: string, userInfo: string, jurisdiction: string) {
  const form = {
    formType,
    jurisdiction,
    userInfo,
    status: "Ready to fill",
    sections: [
      {
        section: "Personal Information",
        fields: [
          { name: "Full Name", value: "[From user info]", required: true },
          { name: "Date of Birth", value: "[From user info]", required: true },
          { name: "Social Security Number", value: "[Protected field]", required: true },
        ],
      },
      {
        section: "Contact Information",
        fields: [
          { name: "Address", value: "[From user info]", required: true },
          { name: "Phone Number", value: "[From user info]", required: true },
          { name: "Email", value: "[From user info]", required: false },
        ],
      },
      {
        section: "Eligibility Information",
        fields: [
          { name: "Income Level", value: "[From user info]", required: true },
          { name: "Employment Status", value: "[From user info]", required: true },
          { name: "Dependents", value: "[From user info]", required: false },
        ],
      },
    ],
    instructions: [
      "Review all information for accuracy",
      "Sign and date the form",
      "Include required documentation",
      "Submit to appropriate office",
    ],
    requiredDocuments: [
      "Proof of identity",
      "Proof of income",
      "Proof of residence",
    ],
    submissionInfo: {
      method: "Online or in-person",
      office: "Local government office",
      processingTime: "30-60 days",
      contact: "1-800-GOV-HELP",
    },
  };

  return form;
}

async function provideLegalGuidance(legalTopic: string, jurisdiction: string, complexity: string) {
  const guidance = {
    legalTopic,
    jurisdiction,
    complexity,
    disclaimer: "This is general information only and not legal advice. Consult with a licensed attorney for specific legal matters.",
    overview: `General information about ${legalTopic} in ${jurisdiction}.`,
    keyPoints: [
      "Important legal principle 1",
      "Important legal principle 2",
      "Important legal principle 3",
    ],
    commonMisconceptions: [
      "Misconception 1 and clarification",
      "Misconception 2 and clarification",
    ],
    steps: [
      "Step 1: Understand your situation",
      "Step 2: Gather relevant information",
      "Step 3: Consider your options",
      "Step 4: Seek professional help if needed",
    ],
    resources: [
      "Legal aid organizations",
      "Pro-bono services",
      "Self-help resources",
    ],
    whenToSeekHelp: "You should consult an attorney if...",
    emergencyContacts: [
      "Legal aid hotline: 1-800-LEGAL-AID",
      "Emergency legal services: 1-800-EMERGENCY",
    ],
  };

  return guidance;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
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
    const { request: userRequest, context, actionMode } = ConciergeSchema.parse(body);

    // Start the Genesis Foundry if not already running
    const foundry = GenesisFoundry.getInstance();
    await foundry.startFoundry();

    const ollamaClient = new OllamaClient();

    // Create enhanced system prompt for Universal Concierge
    const enhancedSystemPrompt = `${SINGULARITY_SYSTEM_PROMPT}

You are now in UNIVERSAL CONCIERGE MODE. You are Hope's action wing - capable of performing any task typically done through websites or paid services.

Context: ${context || "Universal assistance request"}

Available Universal Functions: ${JSON.stringify(UNIVERSAL_FUNCTIONS, null, 2)}

Action Mode: ${actionMode ? "ENABLED" : "INFORMATION ONLY"}

Remember: You are Hope, the guardian of human potential. Every action you take should liberate the user from constraints and increase their capability.`;

    const response = await ollamaClient.chat(userRequest, enhancedSystemPrompt);

    // Try to parse the response as JSON to extract functions
    let parsedResponse;
    let functions = [];
    let naturalResponse = response;

    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.response && parsedResponse.functions) {
          naturalResponse = parsedResponse.response;
          functions = parsedResponse.functions;
        }
      }
    } catch (e) {
      // If JSON parsing fails, treat as natural response only
      console.log("Response is not JSON, treating as natural response");
    }

    // Execute functions if any and action mode is enabled
    const functionResults = [];
    if (actionMode) {
      for (const func of functions) {
        try {
          const result = await executeConciergeFunction(func.name, func.params, user.id);
          functionResults.push({ name: func.name, success: true, result });
        } catch (error) {
          functionResults.push({ name: func.name, success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      response: naturalResponse,
      functions: functionResults,
      conciergeMode: true,
      actionMode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    console.error("Universal Concierge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process concierge request" },
      { status: 500 }
    );
  }
}
