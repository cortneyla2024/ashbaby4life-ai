'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Calendar,
  Clock,
  User,
  Users,
  Globe,
  MapPin,
  Bell,
  BellOff,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Star,
  Bookmark,
  Share,
  Download,
  Upload,
  RefreshCw,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Crop,
  Scissors,
  Layers,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Reply,
  Forward,
  Archive,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Fullscreen,
  Menu,
  Sidebar,
  SidebarClose,
  Layout,
  Columns,
  Rows,
  Grid as GridIcon,
  Columns as ColumnsIcon,
  Rows as RowsIcon,
  Move,
  Grip,
  MousePointer,
  Hand,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Plus as PlusIcon,
  Minus,
  Settings,
  Shield,
  Lock,
  Unlock,
  Database,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Palette,
  Wand2,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Command,
  Keyboard,


  Hash as HashIcon,
  AtSign as AtSignIcon,
  DollarSign as DollarSignIcon,
  Percent as PercentIcon,
  Plus as PlusIcon2,
  Minus as MinusIcon
} from 'lucide-react';

interface WellnessReport {
  id: string;
  date: Date;
  overallScore: number;
  categories: {
    physical: number;
    mental: number;
    social: number;
    financial: number;
    environmental: number;
  };
  insights: string[];
  recommendations: string[];
  trends: {
    period: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

interface HeatmapData {
  id: string;
  category: string;
  data: {
    day: string;
    hour: number;
    value: number;
    activity: string;
  }[];
  colorScale: string[];
}

interface Forecast {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface DataVisualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
  title: string;
  description: string;
  data: any;
  config: {
    colors: string[];
    dimensions: string[];
    metrics: string[];
  };
  lastUpdated: Date;
}

const AdvancedAnalytics: React.FC = () => {
  const [view, setView] = useState<'overview' | 'wellness' | 'heatmaps' | 'forecasts' | 'visualizations' | 'insights'>('overview');
  const [wellnessReports, setWellnessReports] = useState<WellnessReport[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [dataVisualizations, setDataVisualizations] = useState<DataVisualization[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRealTime, setIsRealTime] = useState(true);

  // Mock data
  const mockWellnessReports: WellnessReport[] = [
    {
      id: '1',
      date: new Date(),
      overallScore: 78,
      categories: {
        physical: 82,
        mental: 75,
        social: 70,
        financial: 85,
        environmental: 80
      },
      insights: [
        'Your physical activity has increased by 15% this week',
        'Social interactions are below your usual average',
        'Financial wellness is trending positively',
        'Sleep quality has improved significantly'
      ],
      recommendations: [
        'Schedule more social activities this weekend',
        'Continue your current exercise routine',
        'Consider meditation for mental wellness',
        'Review your budget for continued financial health'
      ],
      trends: {
        period: '7 days',
        change: 5,
        direction: 'up'
      }
    },
    {
      id: '2',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      overallScore: 73,
      categories: {
        physical: 75,
        mental: 70,
        social: 65,
        financial: 80,
        environmental: 75
      },
      insights: [
        'Physical activity was consistent but could be improved',
        'Mental wellness showed some stress indicators',
        'Social connections were limited due to work schedule',
        'Financial planning was on track'
      ],
      recommendations: [
        'Increase physical activity intensity',
        'Practice stress management techniques',
        'Make time for social connections',
        'Continue financial planning habits'
      ],
      trends: {
        period: '7 days',
        change: -2,
        direction: 'down'
      }
    }
  ];

  const mockHeatmapData: HeatmapData[] = [
    {
      id: '1',
      category: 'Productivity',
      data: [
        { day: 'Monday', hour: 9, value: 85, activity: 'Work' },
        { day: 'Monday', hour: 10, value: 90, activity: 'Work' },
        { day: 'Monday', hour: 11, value: 75, activity: 'Meeting' },
        { day: 'Tuesday', hour: 9, value: 80, activity: 'Work' },
        { day: 'Tuesday', hour: 10, value: 95, activity: 'Deep Work' },
        { day: 'Wednesday', hour: 14, value: 70, activity: 'Break' },
        { day: 'Thursday', hour: 16, value: 60, activity: 'End of Day' },
        { day: 'Friday', hour: 11, value: 85, activity: 'Work' }
      ],
      colorScale: ['#f0f9ff', '#0ea5e9', '#0369a1', '#1e40af']
    },
    {
      id: '2',
      category: 'Health',
      data: [
        { day: 'Monday', hour: 7, value: 90, activity: 'Exercise' },
        { day: 'Tuesday', hour: 7, value: 85, activity: 'Exercise' },
        { day: 'Wednesday', hour: 8, value: 70, activity: 'Light Activity' },
        { day: 'Thursday', hour: 7, value: 95, activity: 'Exercise' },
        { day: 'Friday', hour: 7, value: 80, activity: 'Exercise' },
        { day: 'Saturday', hour: 9, value: 75, activity: 'Weekend Activity' },
        { day: 'Sunday', hour: 10, value: 60, activity: 'Rest Day' }
      ],
      colorScale: ['#fef2f2', '#fca5a5', '#ef4444', '#dc2626']
    }
  ];

  const mockForecasts: Forecast[] = [
    {
      id: '1',
      metric: 'Productivity Score',
      currentValue: 78,
      predictedValue: 82,
      confidence: 85,
      timeframe: 'Next 7 days',
      factors: ['Improved sleep patterns', 'Reduced stress levels', 'Better work environment'],
      trend: 'increasing'
    },
    {
      id: '2',
      metric: 'Physical Activity',
      currentValue: 65,
      predictedValue: 70,
      confidence: 78,
      timeframe: 'Next 14 days',
      factors: ['Consistent exercise routine', 'Better weather conditions', 'Increased motivation'],
      trend: 'increasing'
    },
    {
      id: '3',
      metric: 'Social Connections',
      currentValue: 60,
      predictedValue: 55,
      confidence: 65,
      timeframe: 'Next 7 days',
      factors: ['Busy work schedule', 'Limited social events', 'Focus on personal projects'],
      trend: 'decreasing'
    }
  ];

  const mockDataVisualizations: DataVisualization[] = [
    {
      id: '1',
      type: 'line',
      title: 'Wellness Score Trend',
      description: 'Overall wellness score over the past 30 days',
      data: {
        labels: ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 28'],
        datasets: [{
          label: 'Wellness Score',
          data: [72, 75, 78, 76, 78],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      },
      config: {
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
        dimensions: ['Date'],
        metrics: ['Score']
      },
      lastUpdated: new Date()
    },
    {
      id: '2',
      type: 'pie',
      title: 'Wellness Category Distribution',
      description: 'Breakdown of wellness scores by category',
      data: {
        labels: ['Physical', 'Mental', 'Social', 'Financial', 'Environmental'],
        datasets: [{
          data: [82, 75, 70, 85, 80],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
        }]
      },
      config: {
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
        dimensions: ['Category'],
        metrics: ['Score']
      },
      lastUpdated: new Date()
    }
  ];

  useEffect(() => {
    setWellnessReports(mockWellnessReports);
    setHeatmapData(mockHeatmapData);
    setForecasts(mockForecasts);
    setDataVisualizations(mockDataVisualizations);

    // Simulate real-time data updates
    const interval = setInterval(() => {
      if (isRealTime) {
        // Update some metrics with small random variations
        setWellnessReports(prev => prev.map(report => ({
          ...report,
          overallScore: Math.max(0, Math.min(100, report.overallScore + (Math.random() - 0.5) * 2))
        })));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp; // We'll rotate this
      case 'stable': return Activity;
      default: return Activity;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleExportData = (type: string) => {
    console.log(`Exporting ${type} data...`);
  };

  const handleShareInsight = (insight: string) => {
    console.log(`Sharing insight: ${insight}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Analytics & Insights</h1>
          <p className="text-gray-600">Comprehensive wellness reports, interactive heatmaps, predictive forecasts, and data-driven insights</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'wellness', label: 'Wellness Reports', icon: Activity },
            { key: 'heatmaps', label: 'Heatmaps', icon: GridIcon },
            { key: 'forecasts', label: 'Forecasts', icon: TrendingUp },
            { key: 'visualizations', label: 'Visualizations', icon: PieChart },
            { key: 'insights', label: 'Insights', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview */}
            {view === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Wellness Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(wellnessReports[0]?.overallScore || 0)}`}>
                          {wellnessReports[0]?.overallScore || 0}/100
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">7-Day Trend</p>
                        <p className={`text-2xl font-bold ${getTrendColor(wellnessReports[0]?.trends.direction || 'stable')}`}>
                          {wellnessReports[0]?.trends.change > 0 ? '+' : ''}{wellnessReports[0]?.trends.change || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Predictions</p>
                        <p className="text-2xl font-bold text-gray-900">{forecasts.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Insights</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {wellnessReports[0]?.insights.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Wellness Report */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Latest Wellness Report</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsRealTime(!isRealTime)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          isRealTime ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isRealTime ? 'Real-time Active' : 'Real-time Paused'}
                      </button>
                      <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {wellnessReports[0] && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Overall Score</span>
                            <span className={`text-lg font-bold ${getScoreColor(wellnessReports[0].overallScore)}`}>
                              {wellnessReports[0].overallScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                wellnessReports[0].overallScore >= 80 ? 'bg-green-500' :
                                wellnessReports[0].overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${wellnessReports[0].overallScore}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Category Breakdown</h4>
                          {Object.entries(wellnessReports[0].categories).map(([category, score]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">{category}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      score >= 80 ? 'bg-green-500' :
                                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                                  {score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Key Insights</h4>
                        <div className="space-y-3">
                          {wellnessReports[0].insights.slice(0, 3).map((insight, index) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{insight}</p>
                            </div>
                          ))}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-4 mt-6">Recommendations</h4>
                        <div className="space-y-2">
                          {wellnessReports[0].recommendations.slice(0, 2).map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wellness Reports */}
            {view === 'wellness' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Wellness Reports</h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                      <button
                        onClick={() => handleExportData('wellness')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {wellnessReports.map((report) => {
                      const TrendIcon = getTrendIcon(report.trends.direction);
                      return (
                        <motion.div
                          key={report.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">Wellness Report</h4>
                              <p className="text-sm text-gray-600">{formatDate(report.date)}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(report.overallScore)} ${getScoreColor(report.overallScore)}`}>
                                {report.overallScore}/100
                              </div>
                              <div className={`flex items-center space-x-1 ${getTrendColor(report.trends.direction)}`}>
                                <TrendIcon className={`w-4 h-4 ${report.trends.direction === 'down' ? 'rotate-180' : ''}`} />
                                <span className="text-sm font-medium">
                                  {report.trends.change > 0 ? '+' : ''}{report.trends.change}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3">Category Scores</h5>
                              <div className="space-y-3">
                                {Object.entries(report.categories).map(([category, score]) => (
                                  <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            score >= 80 ? 'bg-green-500' :
                                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${score}%` }}
                                        ></div>
                                      </div>
                                      <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                                        {score}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3">Top Insights</h5>
                              <div className="space-y-2">
                                {report.insights.slice(0, 3).map((insight, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Heatmaps */}
            {view === 'heatmaps' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Activity Heatmaps</h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="productivity">Productivity</option>
                        <option value="health">Health</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {heatmapData.map((heatmap) => (
                      <div key={heatmap.id} className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">{heatmap.category} Heatmap</h4>
                        
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="text-center text-xs text-gray-600 font-medium">
                              {day}
                            </div>
                          ))}
                          
                          {Array.from({ length: 7 * 24 }, (_, i) => {
                            const day = Math.floor(i / 24);
                            const hour = i % 24;
                            const dataPoint = heatmap.data.find(d => 
                              d.day.toLowerCase().includes(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][day].toLowerCase()) && 
                              d.hour === hour
                            );
                            const value = dataPoint?.value || 0;
                            const intensity = Math.floor((value / 100) * 4);
                            
                            return (
                              <div
                                key={i}
                                className={`w-8 h-8 rounded border ${
                                  intensity === 0 ? 'bg-gray-100' :
                                  intensity === 1 ? 'bg-blue-200' :
                                  intensity === 2 ? 'bg-blue-400' :
                                  intensity === 3 ? 'bg-blue-600' : 'bg-blue-800'
                                }`}
                                title={`${dataPoint?.activity || 'No activity'} (${value})`}
                              ></div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Low Activity</span>
                          <div className="flex items-center space-x-1">
                            {heatmap.colorScale.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                          <span>High Activity</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Forecasts */}
            {view === 'forecasts' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Predictive Forecasts</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forecasts.map((forecast) => (
                      <motion.div
                        key={forecast.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{forecast.metric}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            forecast.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                            forecast.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {forecast.trend}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Current</span>
                            <span className="text-lg font-bold text-gray-900">{forecast.currentValue}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Predicted</span>
                            <span className="text-lg font-bold text-blue-600">{forecast.predictedValue}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence</span>
                            <span className="text-sm font-medium text-gray-900">{forecast.confidence}%</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Timeframe: {forecast.timeframe}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Key Factors</h5>
                          <div className="space-y-1">
                            {forecast.factors.slice(0, 2).map((factor, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Visualizations */}
            {view === 'visualizations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Interactive Visualizations</h3>
                    <button
                      onClick={() => handleExportData('visualizations')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export Data
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dataVisualizations.map((viz) => (
                      <div key={viz.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">{viz.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(viz.lastUpdated)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{viz.description}</p>
                        
                        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Interactive {viz.type} chart</p>
                            <p className="text-xs text-gray-500">Click to explore data</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                          <span>Type: {viz.type}</span>
                          <span>{viz.config.dimensions.length} dimensions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {view === 'insights' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">AI-Generated Insights</h3>
                  
                  <div className="space-y-6">
                    {wellnessReports[0]?.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Lightbulb className="w-4 h-4 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-gray-900">Insight #{index + 1}</h4>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                AI Generated
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{insight}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Confidence: 85%</span>
                              <span>Generated: {formatDate(new Date())}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleShareInsight(insight)}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Share className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
