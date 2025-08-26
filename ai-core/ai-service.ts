import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export interface AIRequest {
  type: 'search' | 'recommendation' | 'generation' | 'analysis' | 'translation' | 'summarization';
  prompt: string;
  context?: any;
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    model?: string;
  };
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    model: string;
    tokens: number;
    latency: number;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'user' | 'community' | 'product' | 'media';
  score: number;
  metadata?: any;
}

export interface Recommendation {
  id: string;
  type: 'product' | 'content' | 'community' | 'event';
  title: string;
  description: string;
  score: number;
  reason: string;
}

export class AIService extends EventEmitter {
  private process: ChildProcess | null = null;
  private isReady = false;
  private requestQueue: Array<{ request: AIRequest; resolve: (response: AIResponse) => void; reject: (error: Error) => void }> = [];
  private modelPath: string;
  private config: any;

  constructor(modelPath: string, config: any = {}) {
    super();
    this.modelPath = modelPath;
    this.config = {
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      model: 'llama2-7b',
      ...config
    };
  }

  async initialize(): Promise<void> {
    try {
      // Check if model files exist
      if (!fs.existsSync(this.modelPath)) {
        throw new Error(`Model not found at ${this.modelPath}`);
      }

      // Start the AI inference process
      this.process = spawn('python', ['ai-core/inference.py', '--model', this.modelPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        this.handleMessage(message);
      });

      this.process.stderr?.on('data', (data) => {
        console.error('AI Service Error:', data.toString());
      });

      this.process.on('close', (code) => {
        console.log(`AI Service process exited with code ${code}`);
        this.isReady = false;
        this.emit('disconnected');
      });

      // Wait for ready signal
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('AI Service initialization timeout'));
        }, 30000);

        this.once('ready', () => {
          clearTimeout(timeout);
          this.isReady = true;
          resolve();
        });
      });

      console.log('AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  private handleMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ready':
          this.emit('ready');
          break;
        case 'response':
          this.handleResponse(data);
          break;
        case 'error':
          this.handleError(data);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse AI message:', error);
    }
  }

  private handleResponse(data: any): void {
    const { requestId, response } = data;
    const queuedRequest = this.requestQueue.find(q => q.request.id === requestId);
    
    if (queuedRequest) {
      this.requestQueue = this.requestQueue.filter(q => q.request.id !== requestId);
      queuedRequest.resolve(response);
    }
  }

  private handleError(data: any): void {
    const { requestId, error } = data;
    const queuedRequest = this.requestQueue.find(q => q.request.id === requestId);
    
    if (queuedRequest) {
      this.requestQueue = this.requestQueue.filter(q => q.request.id !== requestId);
      queuedRequest.reject(new Error(error));
    }
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady || !this.process) {
      throw new Error('AI Service not ready');
    }

    return new Promise((resolve, reject) => {
      const requestWithId = {
        ...request,
        id: this.generateRequestId(),
        options: { ...this.config, ...request.options }
      };

      this.requestQueue.push({ request: requestWithId, resolve, reject });

      this.process?.stdin?.write(JSON.stringify(requestWithId) + '\n');
    });
  }

  async search(query: string, filters?: any): Promise<SearchResult[]> {
    const response = await this.processRequest({
      type: 'search',
      prompt: query,
      context: { filters }
    });

    if (!response.success) {
      throw new Error(response.error || 'Search failed');
    }

    return response.data || [];
  }

  async getRecommendations(userId: string, context?: any): Promise<Recommendation[]> {
    const response = await this.processRequest({
      type: 'recommendation',
      prompt: `Generate recommendations for user ${userId}`,
      context
    });

    if (!response.success) {
      throw new Error(response.error || 'Recommendation generation failed');
    }

    return response.data || [];
  }

  async generateContent(prompt: string, type: 'text' | 'summary' | 'translation' = 'text'): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt,
      context: { contentType: type }
    });

    if (!response.success) {
      throw new Error(response.error || 'Content generation failed');
    }

    return response.data || '';
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
    const response = await this.processRequest({
      type: 'analysis',
      prompt: `Analyze sentiment: ${text}`,
      context: { analysisType: 'sentiment' }
    });

    if (!response.success) {
      throw new Error(response.error || 'Sentiment analysis failed');
    }

    return response.data || { sentiment: 'neutral', score: 0 };
  }

  async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    const response = await this.processRequest({
      type: 'summarization',
      prompt: `Summarize: ${text}`,
      options: { maxTokens: maxLength }
    });

    if (!response.success) {
      throw new Error(response.error || 'Summarization failed');
    }

    return response.data || '';
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await this.processRequest({
      type: 'translation',
      prompt: `Translate to ${targetLanguage}: ${text}`,
      context: { targetLanguage }
    });

    if (!response.success) {
      throw new Error(response.error || 'Translation failed');
    }

    return response.data || '';
  }

  async generateImageDescription(imagePath: string): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Describe this image: ${imagePath}`,
      context: { contentType: 'image_description' }
    });

    if (!response.success) {
      throw new Error(response.error || 'Image description generation failed');
    }

    return response.data || '';
  }

  async extractKeywords(text: string): Promise<string[]> {
    const response = await this.processRequest({
      type: 'analysis',
      prompt: `Extract keywords: ${text}`,
      context: { analysisType: 'keyword_extraction' }
    });

    if (!response.success) {
      throw new Error(response.error || 'Keyword extraction failed');
    }

    return response.data || [];
  }

  async classifyContent(text: string, categories: string[]): Promise<{ category: string; confidence: number }> {
    const response = await this.processRequest({
      type: 'analysis',
      prompt: `Classify into categories [${categories.join(', ')}]: ${text}`,
      context: { analysisType: 'classification', categories }
    });

    if (!response.success) {
      throw new Error(response.error || 'Content classification failed');
    }

    return response.data || { category: categories[0], confidence: 0 };
  }

  async generateQuestions(text: string, count: number = 5): Promise<string[]> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Generate ${count} questions about: ${text}`,
      context: { contentType: 'questions' }
    });

    if (!response.success) {
      throw new Error(response.error || 'Question generation failed');
    }

    return response.data || [];
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Question: ${question}\nContext: ${context}`,
      context: { contentType: 'answer' }
    });

    if (!response.success) {
      throw new Error(response.error || 'Answer generation failed');
    }

    return response.data || '';
  }

  async generatePersonalizedGreeting(userId: string, userContext: any): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Generate a personalized greeting for user ${userId}`,
      context: { contentType: 'greeting', userContext }
    });

    if (!response.success) {
      throw new Error(response.error || 'Greeting generation failed');
    }

    return response.data || 'Hello!';
  }

  async suggestActivities(userPreferences: any, currentMood: string): Promise<string[]> {
    const response = await this.processRequest({
      type: 'recommendation',
      prompt: `Suggest activities for mood: ${currentMood}`,
      context: { recommendationType: 'activities', userPreferences }
    });

    if (!response.success) {
      throw new Error(response.error || 'Activity suggestion failed');
    }

    return response.data || [];
  }

  async generateHealthInsights(healthData: any): Promise<string> {
    const response = await this.processRequest({
      type: 'analysis',
      prompt: `Analyze health data and provide insights`,
      context: { analysisType: 'health_insights', healthData }
    });

    if (!response.success) {
      throw new Error(response.error || 'Health insights generation failed');
    }

    return response.data || '';
  }

  async detectAnomalies(data: any[], threshold: number = 0.8): Promise<{ anomalies: any[]; confidence: number }> {
    const response = await this.processRequest({
      type: 'analysis',
      prompt: `Detect anomalies in the data`,
      context: { analysisType: 'anomaly_detection', data, threshold }
    });

    if (!response.success) {
      throw new Error(response.error || 'Anomaly detection failed');
    }

    return response.data || { anomalies: [], confidence: 0 };
  }

  async generateCodeSnippet(description: string, language: string): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Generate ${language} code for: ${description}`,
      context: { contentType: 'code', language }
    });

    if (!response.success) {
      throw new Error(response.error || 'Code generation failed');
    }

    return response.data || '';
  }

  async optimizeContent(content: string, targetAudience: string): Promise<string> {
    const response = await this.processRequest({
      type: 'generation',
      prompt: `Optimize content for ${targetAudience}: ${content}`,
      context: { contentType: 'optimization', targetAudience }
    });

    if (!response.success) {
      throw new Error(response.error || 'Content optimization failed');
    }

    return response.data || content;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async shutdown(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.isReady = false;
    console.log('AI Service shutdown complete');
  }

  getStatus(): { isReady: boolean; queueLength: number; model: string } {
    return {
      isReady: this.isReady,
      queueLength: this.requestQueue.length,
      model: this.config.model
    };
  }
}

// Export singleton instance
export const aiService = new AIService(
  process.env.AI_MODEL_PATH || './models/llama2-7b',
  {
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.AI_TOP_P || '0.9'),
    model: process.env.AI_MODEL || 'llama2-7b'
  }
);
