import { z } from 'zod';

// Emotion types
export const EmotionType = z.enum(['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral']);
export type EmotionType = z.infer<typeof EmotionType>;

// Emotion detection result
export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  intensity: number;
  timestamp: Date;
  source: 'text' | 'facial' | 'voice' | 'combined';
}

// Text emotion patterns
const textEmotionPatterns = {
  happy: [
    'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome',
    'delighted', 'thrilled', 'ecstatic', 'elated', 'cheerful', 'glad', 'pleased'
  ],
  sad: [
    'sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'blue', 'melancholy',
    'gloomy', 'sorrowful', 'heartbroken', 'devastated', 'disappointed'
  ],
  angry: [
    'angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'livid', 'enraged',
    'outraged', 'fuming', 'seething', 'hostile', 'aggressive'
  ],
  anxious: [
    'anxious', 'worried', 'nervous', 'stressed', 'concerned', 'fearful', 'tense', 'uneasy',
    'apprehensive', 'panicked', 'terrified', 'scared', 'afraid'
  ],
  excited: [
    'excited', 'thrilled', 'eager', 'enthusiastic', 'pumped', 'energized', 'motivated',
    'inspired', 'passionate', 'zealous', 'ardent'
  ],
  calm: [
    'calm', 'peaceful', 'relaxed', 'serene', 'content', 'satisfied', 'tranquil', 'at ease',
    'composed', 'collected', 'centered', 'balanced'
  ]
};

// Facial expression patterns (simplified)
const facialExpressionPatterns = {
  happy: ['smile', 'grin', 'laugh', 'cheerful', 'bright'],
  sad: ['frown', 'tear', 'droopy', 'downcast', 'gloomy'],
  angry: ['scowl', 'frown', 'furrowed', 'tense', 'stern'],
  anxious: ['worried', 'tense', 'nervous', 'fidgety', 'uneasy'],
  excited: ['wide eyes', 'bright', 'animated', 'energetic'],
  calm: ['relaxed', 'smooth', 'peaceful', 'serene', 'content']
};

// Voice tone patterns (simplified)
const voiceTonePatterns = {
  happy: ['high pitch', 'fast tempo', 'bright tone', 'enthusiastic'],
  sad: ['low pitch', 'slow tempo', 'monotone', 'melancholy'],
  angry: ['loud', 'sharp', 'harsh', 'aggressive', 'forceful'],
  anxious: ['high pitch', 'fast tempo', 'trembling', 'nervous'],
  excited: ['high pitch', 'fast tempo', 'energetic', 'enthusiastic'],
  calm: ['medium pitch', 'steady tempo', 'smooth', 'relaxed']
};

// Emotion detection service
export class EmotionDetectionService {
  private static instance: EmotionDetectionService;
  private currentEmotion: EmotionResult | null = null;
  private emotionHistory: EmotionResult[] = [];

  static getInstance(): EmotionDetectionService {
    if (!EmotionDetectionService.instance) {
      EmotionDetectionService.instance = new EmotionDetectionService();
    }
    return EmotionDetectionService.instance;
  }

  // Detect emotion from text
  detectFromText(text: string): EmotionResult {
    const lowerText = text.toLowerCase();
    const scores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0
    };

    // Calculate scores for each emotion
    for (const [emotion, patterns] of Object.entries(textEmotionPatterns)) {
      const matches = patterns.filter(pattern => lowerText.includes(pattern));
      scores[emotion as EmotionType] = matches.length;
    }

    // Find the emotion with the highest score
    let maxScore = 0;
    let detectedEmotion: EmotionType = 'neutral';

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionType;
      }
    }

    // Calculate confidence based on score
    const totalWords = text.split(' ').length;
    const confidence = Math.min(maxScore / Math.max(totalWords * 0.1, 1), 1);
    const intensity = Math.min(maxScore / 3, 1);

    const result: EmotionResult = {
      emotion: detectedEmotion,
      confidence,
      intensity,
      timestamp: new Date(),
      source: 'text'
    };

    this.updateEmotion(result);
    return result;
  }

  // Detect emotion from facial expression (simplified simulation)
  detectFromFacial(expression: string): EmotionResult {
    const lowerExpression = expression.toLowerCase();
    const scores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0
    };

    // Calculate scores for each emotion
    for (const [emotion, patterns] of Object.entries(facialExpressionPatterns)) {
      const matches = patterns.filter(pattern => lowerExpression.includes(pattern));
      scores[emotion as EmotionType] = matches.length;
    }

    // Find the emotion with the highest score
    let maxScore = 0;
    let detectedEmotion: EmotionType = 'neutral';

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionType;
      }
    }

    const confidence = Math.min(maxScore / 2, 1);
    const intensity = Math.min(maxScore / 3, 1);

    const result: EmotionResult = {
      emotion: detectedEmotion,
      confidence,
      intensity,
      timestamp: new Date(),
      source: 'facial'
    };

    this.updateEmotion(result);
    return result;
  }

  // Detect emotion from voice tone (simplified simulation)
  detectFromVoice(tone: string): EmotionResult {
    const lowerTone = tone.toLowerCase();
    const scores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0
    };

    // Calculate scores for each emotion
    for (const [emotion, patterns] of Object.entries(voiceTonePatterns)) {
      const matches = patterns.filter(pattern => lowerTone.includes(pattern));
      scores[emotion as EmotionType] = matches.length;
    }

    // Find the emotion with the highest score
    let maxScore = 0;
    let detectedEmotion: EmotionType = 'neutral';

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionType;
      }
    }

    const confidence = Math.min(maxScore / 2, 1);
    const intensity = Math.min(maxScore / 3, 1);

    const result: EmotionResult = {
      emotion: detectedEmotion,
      confidence,
      intensity,
      timestamp: new Date(),
      source: 'voice'
    };

    this.updateEmotion(result);
    return result;
  }

  // Combine multiple emotion sources
  detectCombined(text?: string, facial?: string, voice?: string): EmotionResult {
    const results: EmotionResult[] = [];

    if (text) {
      results.push(this.detectFromText(text));
    }
    if (facial) {
      results.push(this.detectFromFacial(facial));
    }
    if (voice) {
      results.push(this.detectFromVoice(voice));
    }

    if (results.length === 0) {
      return {
        emotion: 'neutral',
        confidence: 1,
        intensity: 0,
        timestamp: new Date(),
        source: 'combined'
      };
    }

    // Combine results by averaging scores
    const combinedScores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0
    };

    let totalConfidence = 0;

    for (const result of results) {
      combinedScores[result.emotion] += result.confidence;
      totalConfidence += result.confidence;
    }

    // Find the emotion with the highest combined score
    let maxScore = 0;
    let detectedEmotion: EmotionType = 'neutral';

    for (const [emotion, score] of Object.entries(combinedScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionType;
      }
    }

    const confidence = totalConfidence > 0 ? maxScore / totalConfidence : 0;
    const intensity = results.reduce((sum, r) => sum + r.intensity, 0) / results.length;

    const result: EmotionResult = {
      emotion: detectedEmotion,
      confidence,
      intensity,
      timestamp: new Date(),
      source: 'combined'
    };

    this.updateEmotion(result);
    return result;
  }

  // Get current emotion
  getCurrentEmotion(): EmotionResult | null {
    return this.currentEmotion;
  }

  // Get emotion history
  getEmotionHistory(): EmotionResult[] {
    return [...this.emotionHistory];
  }

  // Get emotion trend
  getEmotionTrend(duration: number = 24): EmotionType {
    const now = new Date();
    const cutoff = new Date(now.getTime() - duration * 60 * 60 * 1000); // hours to milliseconds

    const recentEmotions = this.emotionHistory.filter(
      emotion => emotion.timestamp > cutoff
    );

    if (recentEmotions.length === 0) {
      return 'neutral';
    }

    // Count emotions
    const emotionCounts: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0
    };

    for (const emotion of recentEmotions) {
      emotionCounts[emotion.emotion]++;
    }

    // Find most common emotion
    let maxCount = 0;
    let trend: EmotionType = 'neutral';

    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        trend = emotion as EmotionType;
      }
    }

    return trend;
  }

  // Clear emotion history
  clearHistory(): void {
    this.emotionHistory = [];
    this.currentEmotion = null;
  }

  private updateEmotion(result: EmotionResult): void {
    this.currentEmotion = result;
    this.emotionHistory.push(result);

    // Keep only last 100 emotions
    if (this.emotionHistory.length > 100) {
      this.emotionHistory = this.emotionHistory.slice(-100);
    }
  }
}

// Export singleton instance
export const emotionDetectionService = EmotionDetectionService.getInstance();

// React hook for emotion detection
export function useEmotionDetection() {
  return {
    detectFromText: emotionDetectionService.detectFromText.bind(emotionDetectionService),
    detectFromFacial: emotionDetectionService.detectFromFacial.bind(emotionDetectionService),
    detectFromVoice: emotionDetectionService.detectFromVoice.bind(emotionDetectionService),
    detectCombined: emotionDetectionService.detectCombined.bind(emotionDetectionService),
    getCurrentEmotion: emotionDetectionService.getCurrentEmotion.bind(emotionDetectionService),
    getEmotionHistory: emotionDetectionService.getEmotionHistory.bind(emotionDetectionService),
    getEmotionTrend: emotionDetectionService.getEmotionTrend.bind(emotionDetectionService),
    clearHistory: emotionDetectionService.clearHistory.bind(emotionDetectionService),
  };
}
