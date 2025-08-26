import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  MicOff, 
  Camera, 
  X, 
  Filter, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff,
  Sparkles,
  History,
  Bookmark,
  Share,
  Download,
  Volume2,
  VolumeX,
  Sparkle,
  Zap,
  Target,
  Users,
  FileText,
  Video,
  Music,
  Image,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';

const UniversalSearch = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('text'); // text, voice, image
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    date: 'all',
    source: 'all',
    language: 'en'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [aiEnhancement, setAiEnhancement] = useState(true);

  const searchInputRef = useRef(null);
  const voiceRecognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      voiceRecognitionRef.current = new SpeechRecognition();
      voiceRecognitionRef.current.continuous = true;
      voiceRecognitionRef.current.interimResults = true;
      voiceRecognitionRef.current.lang = 'en-US';

      voiceRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setVoiceTranscript(finalTranscript + interimTranscript);
        if (finalTranscript) {
          setQuery(finalTranscript);
          performSearch(finalTranscript);
        }
      };

      voiceRecognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      voiceRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);

    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock results based on query
      const mockResults = generateMockResults(searchQuery);
      setResults(mockResults);

      // Generate AI suggestions
      if (aiEnhancement) {
        const aiSuggestions = generateAISuggestions(searchQuery);
        setSuggestions(aiSuggestions);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, aiEnhancement]);

  const generateMockResults = (query) => {
    const resultTypes = [
      { type: 'document', icon: FileText, color: 'blue' },
      { type: 'video', icon: Video, color: 'red' },
      { type: 'audio', icon: Music, color: 'green' },
      { type: 'image', icon: Image, color: 'purple' },
      { type: 'community', icon: Users, color: 'orange' },
      { type: 'web', icon: Globe, color: 'indigo' }
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const resultType = resultTypes[Math.floor(Math.random() * resultTypes.length)];
      return {
        id: `result-${i}`,
        title: `${query} - ${resultType.type} result ${i + 1}`,
        description: `This is a sample ${resultType.type} result related to "${query}". It contains relevant information and metadata.`,
        type: resultType.type,
        icon: resultType.icon,
        color: resultType.color,
        url: `#${resultType.type}-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        relevance: Math.random() * 100,
        tags: ['relevant', 'helpful', 'verified'],
        privacy: privacyMode ? 'private' : 'public'
      };
    }).sort((a, b) => b.relevance - a.relevance);
  };

  const generateAISuggestions = (query) => {
    const suggestions = [
      `"${query}" health benefits`,
      `"${query}" community discussions`,
      `"${query}" learning resources`,
      `"${query}" expert advice`,
      `"${query}" related topics`
    ];
    return suggestions.slice(0, 5);
  };

  const handleVoiceSearch = () => {
    if (!voiceRecognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      voiceRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      voiceRecognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setSearchType('image');
        // Simulate image search
        performSearch(`image search: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setSelectedImage(null);
    setVoiceTranscript('');
  };

  const togglePrivacyMode = () => {
    setPrivacyMode(!privacyMode);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Universal Search
          </h1>
          <p className="text-lg text-gray-600">
            Search across all your data, community, and knowledge with AI-powered enhancements
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* Search Type Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'text', label: 'Text', icon: Search },
              { id: 'voice', label: 'Voice', icon: Mic },
              { id: 'image', label: 'Image', icon: Camera }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchType(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  searchType === tab.id
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                {searchType === 'image' && selectedImage && (
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-6 h-6 rounded object-cover"
                    />
                  </div>
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchType === 'voice' ? voiceTranscript : query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchType === 'text' ? 'Search anything...' :
                    searchType === 'voice' ? 'Click microphone to start...' :
                    'Upload an image to search...'
                  }
                  className={`w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    searchType === 'image' && selectedImage ? 'pl-12' : ''
                  }`}
                  disabled={searchType === 'voice' && isListening}
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Actions */}
              <div className="flex items-center space-x-2">
                {searchType === 'voice' && (
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-4 rounded-xl transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}

                {searchType === 'image' && (
                  <button
                    type="button"
                    onClick={handleImageSearch}
                    className="p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (!query && searchType !== 'image')}
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Hidden file input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </form>

          {/* Privacy and AI Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePrivacyMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  privacyMode
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {privacyMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {privacyMode ? 'Private Mode' : 'Public Mode'}
                </span>
              </button>

              <button
                onClick={() => setAiEnhancement(!aiEnhancement)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  aiEnhancement
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {aiEnhancement ? 'AI Enhanced' : 'Basic Search'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="document">Documents</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="image">Images</option>
                      <option value="community">Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <select
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sources</option>
                      <option value="local">Local Files</option>
                      <option value="community">Community</option>
                      <option value="web">Web Content</option>
                      <option value="ai">AI Generated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="all">All Languages</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              AI Suggestions
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    performSearch(suggestion);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {results.length} results found
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Relevance</span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((result) => (
                <SearchResult key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="w-5 h-5 text-gray-500 mr-2" />
              Recent Searches
            </h3>
            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(item);
                    performSearch(item);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">{item}</span>
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchResult = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = (type) => {
    const colors = {
      document: 'bg-blue-100 text-blue-700',
      video: 'bg-red-100 text-red-700',
      audio: 'bg-green-100 text-green-700',
      image: 'bg-purple-100 text-purple-700',
      community: 'bg-orange-100 text-orange-700',
      web: 'bg-indigo-100 text-indigo-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(result.type)}`}>
          <result.icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {result.title}
              </h4>
              <p className="text-gray-600 mb-2">
                {result.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                <span>•</span>
                <span>{Math.round(result.relevance)}% relevant</span>
                <span>•</span>
                <span className={`flex items-center space-x-1 ${
                  result.privacy === 'private' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {result.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  <span>{result.privacy}</span>
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                {result.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Actions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalSearch;
