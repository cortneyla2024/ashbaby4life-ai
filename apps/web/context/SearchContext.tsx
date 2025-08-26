import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SearchResult {
  id: string;
  type: 'file' | 'message' | 'document' | 'media' | 'user';
  title: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
  score: number;
}

interface SearchFilters {
  types: string[];
  dateRange?: { start: Date; end: Date };
  tags: string[];
  privacy: 'all' | 'public' | 'private';
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  performSearch: (query: string, filters?: SearchFilters) => Promise<void>;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    tags: [],
    privacy: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addToHistory = useCallback((query: string) => {
    if (query.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== query);
        return [query, ...filtered].slice(0, 10);
      });
    }
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'document',
          title: 'Sample Document',
          content: 'This is a sample document that matches your search query.',
          score: 0.95,
        },
        {
          id: '2',
          type: 'message',
          title: 'Recent Message',
          content: 'A message containing relevant information.',
          score: 0.87,
        },
      ];

      setResults(mockResults);
      addToHistory(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToHistory]);

  const value: SearchContextType = {
    query,
    setQuery,
    results,
    setResults,
    filters,
    setFilters,
    isLoading,
    setIsLoading,
    searchHistory,
    addToHistory,
    clearHistory,
    performSearch,
    suggestions,
    setSuggestions,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
