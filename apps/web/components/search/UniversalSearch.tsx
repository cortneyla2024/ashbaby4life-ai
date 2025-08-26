'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Mic, Camera, X, Filter, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSearch } from '@/context/SearchContext';
import { useToaster } from '@/components/ui/Toaster';

// Type declarations for Speech Recognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SearchResult {
  id: string;
  type: 'text' | 'voice' | 'image' | 'file' | 'contact' | 'event' | 'task';
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
  relevance: number;
  tags: string[];
  timestamp: Date;
}

interface UniversalSearchProps {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  onResultSelect?: (result: SearchResult) => void;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({
  className = '',
  placeholder = 'Search everything...',
  showFilters = true,
  showHistory = true,
  onResultSelect,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'image'>('text');
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    privacy: 'all',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, performSearch } = useSearch();
  const { addToast } = useToaster();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('careconnect-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('careconnect-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Handle search submission
  const handleSearch = useCallback(async (searchTerm: string = searchInput) => {
    if (!searchTerm.trim()) return;

    saveRecentSearch(searchTerm);
    setQuery(searchTerm);
    setShowSuggestions(false);
    setSearchError(null);

    try {
      // Trigger search through context
      await performSearch(searchTerm);
      addToast({
        type: 'success',
        title: 'Search completed',
        message: `Found ${results.length} results for "${searchTerm}"`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to perform search. Please try again.';
      setSearchError(errorMessage);
      addToast({
        type: 'error',
        title: 'Search failed',
        message: errorMessage,
      });
    }
  }, [searchInput, results.length, saveRecentSearch, setQuery, performSearch, addToast]);

  // Handle voice search
  const handleVoiceSearch = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addToast({
        type: 'error',
        title: 'Voice search not supported',
        message: 'Your browser does not support voice recognition.',
      });
      return;
    }

    setIsListening(true);
    setSearchMode('voice');

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        addToast({
          type: 'error',
          title: 'Voice recognition failed',
          message: 'Please try again or use text search.',
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      addToast({
        type: 'error',
        title: 'Voice search failed',
        message: 'Unable to start voice recognition.',
      });
    }
  }, [handleSearch, addToast]);

  // Handle image search
  const handleImageSearch = useCallback(async () => {
    setIsCapturing(true);
    setSearchMode('image');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real implementation, you would capture the image and send it for analysis
      // For now, we'll simulate the process
      
      setTimeout(() => {
        setIsCapturing(false);
        addToast({
          type: 'success',
          title: 'Image captured',
          message: 'Analyzing image for search...',
        });
        
        // Simulate image analysis result
        const imageQuery = 'image analysis result';
        setQuery(imageQuery);
        handleSearch(imageQuery);
      }, 2000);
    } catch (error) {
      setIsCapturing(false);
      addToast({
        type: 'error',
        title: 'Camera access denied',
        message: 'Please allow camera access for image search.',
      });
    }
  }, [handleSearch, addToast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'Enter':
            if (document.activeElement === searchInputRef.current) {
              event.preventDefault();
              handleSearch();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSearch]);

  // Handle input changes
  const handleInputChange = (value: string) => {
    setSearchInput(value);
    setShowSuggestions(value.length > 0);
    
    if (value.length === 0) {
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Get search suggestions
  const getSuggestions = () => {
    if (!query.trim()) return [];
    
    const suggestions = [
      ...recentSearches.filter(s => s.toLowerCase().includes(query.toLowerCase())),
      // Add more intelligent suggestions based on context
      'health records',
      'financial reports',
      'learning progress',
      'family activities',
      'community events',
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
    
    return [...new Set(suggestions)].slice(0, 5);
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="flex-shrink-0 pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <Input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent focus:ring-0 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          {query && (
            <button
              onClick={clearSearch}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex-shrink-0 flex items-center border-l border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-2 ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageSearch}
              disabled={isCapturing}
              className={`p-2 ${isCapturing ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Camera className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {getSuggestions().length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Suggestions
                </h4>
                <div className="space-y-1">
                  {getSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Search Filters */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            variant={filters.type === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
              className="w-full h-full"
            >
              All
            </button>
          </Badge>
          <Badge
            variant={filters.type === 'text' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'text' }))}
              className="w-full h-full"
            >
              Text
            </button>
          </Badge>
          <Badge
            variant={filters.type === 'voice' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'voice' }))}
              className="w-full h-full"
            >
              Voice
            </button>
          </Badge>
          <Badge
            variant={filters.type === 'image' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'image' }))}
              className="w-full h-full"
            >
              Image
            </button>
          </Badge>
          <Badge
            variant={filters.privacy === 'private' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            <button
              onClick={() => setFilters(prev => ({ ...prev, privacy: 'private' }))}
              className="w-full h-full"
            >
              Private Only
            </button>
          </Badge>
        </div>
      )}

      {/* Search Status */}
      {isLoading && (
        <div className="mt-2 text-sm text-gray-500">
          Searching...
        </div>
      )}

      {searchError && (
        <div className="mt-2 text-sm text-red-500">
          {searchError}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="mt-2 text-xs text-gray-400">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd> to focus search
      </div>
    </div>
  );
};

export default UniversalSearch;
export { UniversalSearch };
