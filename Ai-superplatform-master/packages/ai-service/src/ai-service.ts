// @vitality/ai-service module
import { ascendedAI } from './ascended-core';
import { genesisFoundry } from './genesis-foundry';

export { ascendedAI, genesisFoundry };

// AI Service Interface
export interface AIResponse {
  content: string;
  emotion?: string;
  confidence: number;
  suggestions?: string[];
  followUp?: string;
}

export interface AIRequest {
  message: string;
  context?: string;
  emotion?: string;
  userId?: string;
  sessionId?: string;
}

// Local AI Knowledge Base
const knowledgeBase = {
  greetings: [
    "Hello! I'm your AI companion. How can I help you today?",
    "Hi there! I'm here to support your journey. What would you like to work on?",
    "Welcome! I'm ready to help you optimize your life. What's on your mind?",
  ],
  health: [
    "I can help you track your health goals, suggest exercises, and provide wellness tips.",
    "Let's work on your health together. I can help with nutrition, exercise, and mental wellness.",
    "Your health is important. I can assist with tracking, planning, and motivation.",
  ],
  finance: [
    "I can help you manage your finances, track expenses, and plan for the future.",
    "Let's work on your financial goals together. I can assist with budgeting and planning.",
    "Financial wellness is key. I can help you track spending and set savings goals.",
  ],
  learning: [
    "I can help you create learning plans, track progress, and suggest resources.",
    "Let's accelerate your learning journey. I can assist with study techniques and resources.",
    "Continuous learning is powerful. I can help you organize and track your educational goals.",
  ],
  goals: [
    "I can help you set, track, and achieve your goals with smart planning and reminders.",
    "Let's work on your goals together. I can help break them down into manageable steps.",
    "Goal achievement is my specialty. I can help you plan, track, and stay motivated.",
  ],
  general: [
    "I'm here to help you optimize every aspect of your life. What would you like to focus on?",
    "I can assist with health, finance, learning, goals, and much more. What interests you?",
    "Let's work together to improve your life. I'm here to support your growth and success.",
  ],
};

// Emotion detection patterns
const emotionPatterns = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'concerned', 'fearful'],
  angry: ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'satisfied'],
};

// Response templates
const responseTemplates = {
  greeting: (emotion?: string) => {
    const responses = knowledgeBase.greetings;
    return responses[Math.floor(Math.random() * responses.length)];
  },
  health: (emotion?: string) => {
    const responses = knowledgeBase.health;
    return responses[Math.floor(Math.random() * responses.length)];
  },
  finance: (emotion?: string) => {
    const responses = knowledgeBase.finance;
    return responses[Math.floor(Math.random() * responses.length)];
  },
  learning: (emotion?: string) => {
    const responses = knowledgeBase.learning;
    return responses[Math.floor(Math.random() * responses.length)];
  },
  goals: (emotion?: string) => {
    const responses = knowledgeBase.goals;
    return responses[Math.floor(Math.random() * responses.length)];
  },
  general: (emotion?: string) => {
    const responses = knowledgeBase.general;
    return responses[Math.floor(Math.random() * responses.length)];
  },
};

// Detect emotion from text
function detectEmotion(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      return emotion;
    }
  }
  
  return undefined;
}

// Categorize user intent
function categorizeIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('health') || lowerMessage.includes('exercise') || lowerMessage.includes('wellness')) {
    return 'health';
  }
  if (lowerMessage.includes('finance') || lowerMessage.includes('money') || lowerMessage.includes('budget')) {
    return 'finance';
  }
  if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('education')) {
    return 'learning';
  }
  if (lowerMessage.includes('goal') || lowerMessage.includes('target') || lowerMessage.includes('achieve')) {
    return 'goals';
  }
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greeting';
  }
  
  return 'general';
}

// Generate contextual response
function generateResponse(message: string, emotion?: string): AIResponse {
  const intent = categorizeIntent(message);
  const detectedEmotion = emotion || detectEmotion(message);
  
  let content = '';
  let confidence = 0.8;
  let suggestions: string[] = [];
  let followUp = '';
  
  switch (intent) {
    case 'greeting':
      content = responseTemplates.greeting(detectedEmotion);
      suggestions = ['Tell me about your health goals', 'Let\'s work on your finances', 'What would you like to learn today?'];
      break;
    case 'health':
      content = responseTemplates.health(detectedEmotion);
      suggestions = ['Track your daily exercise', 'Set nutrition goals', 'Monitor your sleep patterns'];
      followUp = 'Would you like me to help you set up a health tracking plan?';
      break;
    case 'finance':
      content = responseTemplates.finance(detectedEmotion);
      suggestions = ['Create a budget', 'Track your expenses', 'Set savings goals'];
      followUp = 'Should we start by creating a budget together?';
      break;
    case 'learning':
      content = responseTemplates.learning(detectedEmotion);
      suggestions = ['Create a study schedule', 'Set learning goals', 'Find educational resources'];
      followUp = 'What subject would you like to focus on?';
      break;
    case 'goals':
      content = responseTemplates.goals(detectedEmotion);
      suggestions = ['Set SMART goals', 'Create action plans', 'Track your progress'];
      followUp = 'What specific goal would you like to work on?';
      break;
    default:
      content = responseTemplates.general(detectedEmotion);
      suggestions = ['Explore health features', 'Check out financial tools', 'Discover learning resources'];
      break;
  }
  
  // Add emotional context
  if (detectedEmotion) {
    if (detectedEmotion === 'sad' || detectedEmotion === 'anxious') {
      content += " I notice you might be feeling a bit down. Remember, I'm here to support you, and it's okay to take things one step at a time.";
    } else if (detectedEmotion === 'angry') {
      content += " I sense some frustration. Let's work through this together and find a solution that works for you.";
    } else if (detectedEmotion === 'happy') {
      content += " I'm glad you're feeling positive! This is a great time to work on your goals.";
    }
  }
  
  return {
    content,
    emotion: detectedEmotion,
    confidence,
    suggestions,
    followUp,
  };
}

// Main AI Service Class
export class AIService {
  private static instance: AIService;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> = [];
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: request.message,
      timestamp: new Date(),
    });
    
    // Generate response
    const response = generateResponse(request.message, request.emotion);
    
    // Add response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
    });
    
    // Keep only last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
    
    return response;
  }
  
  async *streamResponse(request: AIRequest): AsyncGenerator<string> {
    const response = await this.generateResponse(request);
    const words = response.content.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate typing
    }
  }
  
  getConversationHistory() {
    return [...this.conversationHistory];
  }
  
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// React hook for AI service
export function useAIService() {
  return {
    generateResponse: aiService.generateResponse.bind(aiService),
    streamResponse: aiService.streamResponse.bind(aiService),
    getConversationHistory: aiService.getConversationHistory.bind(aiService),
    clearHistory: aiService.clearHistory.bind(aiService),
  };
}

export const aiservice = {
  version: '1.0.0',
  name: '@vitality/ai-service',
  ascendedAI,
  genesisFoundry,
  aiService,
  useAIService,
};

// Export types
export type { AIIdentity, AIPrinciple, AIPersona, AIResponse, AIState } from './ascended-core';
export type { KnowledgeNode, MicroModel, InternalService, Resource } from './genesis-foundry';
