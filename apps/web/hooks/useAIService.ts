import { useState, useCallback } from 'react';

interface AIResponse {
  text: string;
  confidence: number;
  sources?: string[];
  emotions?: string[];
  suggestions?: string[];
}

interface AIServiceConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  persona: string;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AIServiceConfig>({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    persona: 'helpful'
  });

  const generateResponse = useCallback(async (
    prompt: string,
    context?: string,
    options?: Partial<AIServiceConfig>
  ): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          context,
          config: { ...config, ...options }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config]);

  const analyzeText = useCallback(async (text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    emotions: string[];
    topics: string[];
    summary: string;
  }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizeText = useCallback(async (
    text: string,
    maxLength: number = 200
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, maxLength }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize text');
      }

      const data = await response.json();
      return data.summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const translateText = useCallback(async (
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate text');
      }

      const data = await response.json();
      return data.translation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateImage = useCallback(async (
    prompt: string,
    style?: string,
    size?: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt, style, size }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const summarizeArticle = useCallback(async (articleId: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/summarize-article/${articleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to summarize article');
      }

      const data = await response.json();
      return data.summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeSentiment = useCallback(async (text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateExplainers = useCallback(async (articleId: string): Promise<{
    videoUrl?: string;
    infographicUrl?: string;
    audioUrl?: string;
  }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/generate-explainer/${articleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate explainer');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AIServiceConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    config,
    generateResponse,
    analyzeText,
    summarizeText,
    translateText,
    generateImage,
    summarizeArticle,
    analyzeSentiment,
    generateExplainers,
    updateConfig,
    clearError,
  };
};
