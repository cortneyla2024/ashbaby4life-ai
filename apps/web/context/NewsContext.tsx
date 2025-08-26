import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  isBookmarked: boolean;
}

interface NewsPreferences {
  categories: string[];
  sources: string[];
  keywords: string[];
  excludeKeywords: string[];
  priority: 'high' | 'medium' | 'low' | 'all';
}

interface NewsContextType {
  newsItems: NewsItem[];
  setNewsItems: (items: NewsItem[]) => void;
  preferences: NewsPreferences;
  setPreferences: (preferences: NewsPreferences) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchNews: (filters?: any) => Promise<NewsItem[]>;
  markAsRead: (newsId: string) => void;
  bookmarkNews: (newsId: string) => void;
  updatePreferences: (updates: Partial<NewsPreferences>) => void;
  getNewsSummary: () => Promise<string>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: [],
    sources: [],
    keywords: [],
    excludeKeywords: [],
    priority: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchNews = useCallback(async (filters?: any): Promise<NewsItem[]> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock news items
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Sample News Article',
          content: 'This is a sample news article content.',
          summary: 'Sample news summary',
          source: 'Sample Source',
          url: 'https://example.com',
          publishedAt: new Date(),
          category: 'technology',
          tags: ['tech', 'sample'],
          sentiment: 'positive',
          priority: 'medium',
          isRead: false,
          isBookmarked: false,
        },
      ];
      
      setNewsItems(mockNews);
      return mockNews;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback((newsId: string) => {
    setNewsItems(prev =>
      prev.map(item =>
        item.id === newsId ? { ...item, isRead: true } : item
      )
    );
  }, []);

  const bookmarkNews = useCallback((newsId: string) => {
    setNewsItems(prev =>
      prev.map(item =>
        item.id === newsId ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  }, []);

  const updatePreferences = useCallback((updates: Partial<NewsPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const getNewsSummary = useCallback(async (): Promise<string> => {
    try {
      // Simulate AI summary generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'AI-generated news summary based on your preferences and reading history.';
    } catch (error) {
      console.error('Failed to generate news summary:', error);
      return 'Unable to generate news summary at this time.';
    }
  }, []);

  const value: NewsContextType = {
    newsItems,
    setNewsItems,
    preferences,
    setPreferences,
    isLoading,
    setIsLoading,
    fetchNews,
    markAsRead,
    bookmarkNews,
    updatePreferences,
    getNewsSummary,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};
