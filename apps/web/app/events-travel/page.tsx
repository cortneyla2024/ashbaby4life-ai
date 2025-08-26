'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Heart,
  Share,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Plane,
  Train,
  Bus,
  Car,
  Bike,
  User,
  Eye,
  EyeOff,
  MoreHorizontal,
  Navigation,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Tag,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Camera,
  Video,
  Music,
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Accessibility
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: string;
  coordinates: { lat: number; lng: number };
  organizer: string;
  price: number;
  currency: string;
  capacity: number;
  registeredAttendees: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  isAccessible: boolean;
  accessibilityFeatures: string[];
  isBookmarked: boolean;
  isRegistered: boolean;
}

interface Itinerary {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  items: ItineraryItem[];
  totalCost: number;
  currency: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ItineraryItem {
  id: string;
  type: 'event' | 'transport' | 'accommodation' | 'activity';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  cost: number;
  currency: string;
  bookingReference?: string;
  notes?: string;
}

interface TransportOption {
  id: string;
  type: 'plane' | 'train' | 'bus' | 'car' | 'bike' | 'walking';
  provider: string;
  departure: string;
  arrival: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // minutes
  price: number;
  currency: string;
  isAccessible: boolean;
  accessibilityFeatures: string[];
  carbonFootprint: number; // kg CO2
}

interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'camping';
  address: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  price: number;
  currency: string;
  amenities: string[];
  isAccessible: boolean;
  accessibilityFeatures: string[];
  images: string[];
}

const EventsAndTravel: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [view, setView] = useState<'events' | 'itineraries' | 'transport' | 'accommodation' | 'planning'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false);

  // Mock data
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Annual technology conference featuring AI, blockchain, and future tech trends',
      category: 'Technology',
      startDate: new Date('2024-03-15T09:00:00'),
      endDate: new Date('2024-03-17T18:00:00'),
      location: 'San Francisco Convention Center',
      address: '123 Main St, San Francisco, CA 94102',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      organizer: 'Tech Events Inc.',
      price: 299,
      currency: 'USD',
      capacity: 1000,
      registeredAttendees: 750,
      rating: 4.8,
      reviews: 156,
      image: '/api/placeholder/400/250',
      tags: ['technology', 'ai', 'blockchain', 'networking'],
      isAccessible: true,
      accessibilityFeatures: ['wheelchair accessible', 'sign language interpreters', 'assistive listening devices'],
      isBookmarked: true,
      isRegistered: false
    },
    {
      id: '2',
      title: 'Music Festival in the Park',
      description: 'Three-day outdoor music festival featuring local and international artists',
      category: 'Music',
      startDate: new Date('2024-04-20T14:00:00'),
      endDate: new Date('2024-04-22T23:00:00'),
      location: 'Central Park',
      address: 'Central Park, New York, NY 10024',
      coordinates: { lat: 40.7829, lng: -73.9654 },
      organizer: 'Music Festivals LLC',
      price: 89,
      currency: 'USD',
      capacity: 5000,
      registeredAttendees: 3200,
      rating: 4.6,
      reviews: 89,
      image: '/api/placeholder/400/250',
      tags: ['music', 'festival', 'outdoor', 'live music'],
      isAccessible: true,
      accessibilityFeatures: ['wheelchair accessible', 'accessible seating', 'service animal friendly'],
      isBookmarked: false,
      isRegistered: true
    }
  ];

  const mockItineraries: Itinerary[] = [
    {
      id: '1',
      name: 'San Francisco Tech Trip',
      description: 'Weekend trip to attend Tech Conference 2024',
      startDate: new Date('2024-03-14'),
      endDate: new Date('2024-03-17'),
      destination: 'San Francisco, CA',
      items: [
        {
          id: '1',
          type: 'transport',
          title: 'Flight to SFO',
          description: 'Direct flight from JFK to San Francisco',
          startTime: new Date('2024-03-14T08:00:00'),
          endTime: new Date('2024-03-14T11:30:00'),
          location: 'JFK Airport → SFO Airport',
          cost: 450,
          currency: 'USD',
          bookingReference: 'AA1234'
        },
        {
          id: '2',
          type: 'accommodation',
          title: 'Hotel Stay',
          description: '3 nights at Marriott Downtown',
          startTime: new Date('2024-03-14T15:00:00'),
          endTime: new Date('2024-03-17T11:00:00'),
          location: 'Marriott Downtown SF',
          cost: 600,
          currency: 'USD',
          bookingReference: 'MAR123456'
        },
        {
          id: '3',
          type: 'event',
          title: 'Tech Conference 2024',
          description: 'Main conference event',
          startTime: new Date('2024-03-15T09:00:00'),
          endTime: new Date('2024-03-17T18:00:00'),
          location: 'San Francisco Convention Center',
          cost: 299,
          currency: 'USD'
        }
      ],
      totalCost: 1349,
      currency: 'USD',
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  const mockTransportOptions: TransportOption[] = [
    {
      id: '1',
      type: 'plane',
      provider: 'American Airlines',
      departure: 'JFK',
      arrival: 'SFO',
      departureTime: new Date('2024-03-14T08:00:00'),
      arrivalTime: new Date('2024-03-14T11:30:00'),
      duration: 210,
      price: 450,
      currency: 'USD',
      isAccessible: true,
      accessibilityFeatures: ['wheelchair assistance', 'priority boarding'],
      carbonFootprint: 850
    },
    {
      id: '2',
      type: 'train',
      provider: 'Amtrak',
      departure: 'Penn Station',
      arrival: 'San Francisco',
      departureTime: new Date('2024-03-14T10:00:00'),
      arrivalTime: new Date('2024-03-15T14:00:00'),
      duration: 1680,
      price: 180,
      currency: 'USD',
      isAccessible: true,
      accessibilityFeatures: ['wheelchair accessible', 'accessible seating'],
      carbonFootprint: 120
    }
  ];

  const mockAccommodations: Accommodation[] = [
    {
      id: '1',
      name: 'Marriott Downtown San Francisco',
      type: 'hotel',
      address: '55 4th St, San Francisco, CA 94103',
      coordinates: { lat: 37.7869, lng: -122.4014 },
      rating: 4.5,
      price: 200,
      currency: 'USD',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Pool', 'Business Center'],
      isAccessible: true,
      accessibilityFeatures: ['wheelchair accessible', 'accessible rooms', 'roll-in showers'],
      images: ['/api/placeholder/300/200', '/api/placeholder/300/200']
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    setItineraries(mockItineraries);
    setTransportOptions(mockTransportOptions);
    setAccommodations(mockAccommodations);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'plane': return Plane;
      case 'train': return Train;
      case 'bus': return Bus;
      case 'car': return Car;
      case 'bike': return Bike;
      case 'walking': return User;
      default: return Car;
    }
  };

  const handleBookmarkEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isBookmarked: !event.isBookmarked }
        : event
    ));
  };

  const handleRegisterEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: !event.isRegistered }
        : event
    ));
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesAccessibility = !showAccessibleOnly || event.isAccessible;
    return matchesSearch && matchesCategory && matchesAccessibility;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Events & Travel</h1>
          <p className="text-gray-600">Discover events, plan trips, and explore the world with accessibility in mind</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { key: 'events', label: 'Events', icon: Calendar },
            { key: 'itineraries', label: 'Itineraries', icon: MapPin },
            { key: 'transport', label: 'Transport', icon: Plane },
            { key: 'accommodation', label: 'Accommodation', icon: MapIcon },
            { key: 'planning', label: 'Planning', icon: Navigation }
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
            {/* Events View */}
            {view === 'events' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search events..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="Technology">Technology</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                    </select>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showAccessibleOnly}
                        onChange={(e) => setShowAccessibleOnly(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Accessible only</span>
                    </label>
                  </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        {event.isAccessible && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                            <User className="w-4 h-4 inline mr-1" />
                            Accessible
                          </div>
                        )}
                        <button
                          onClick={() => handleBookmarkEvent(event.id)}
                          className={`absolute top-2 right-2 p-2 rounded-full ${
                            event.isBookmarked 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${event.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {event.category}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{event.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{event.registeredAttendees}/{event.capacity} registered</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(event.price, event.currency)}
                          </span>
                          {event.isRegistered ? (
                            <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                              Registered
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegisterEvent(event.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Itineraries View */}
            {view === 'itineraries' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">My Itineraries</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Create Itinerary
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {itineraries.map((itinerary) => (
                      <motion.div
                        key={itinerary.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{itinerary.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{itinerary.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
                              <span>{itinerary.destination}</span>
                              <span className="font-semibold">
                                Total: {formatCurrency(itinerary.totalCost, itinerary.currency)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Share className="w-5 h-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {itinerary.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                {item.type === 'event' && <Calendar className="w-4 h-4 text-blue-600" />}
                                {item.type === 'transport' && <Plane className="w-4 h-4 text-blue-600" />}
                                {item.type === 'accommodation' && <MapIcon className="w-4 h-4 text-blue-600" />}
                                {item.type === 'activity' && <Navigation className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                  <span>{item.location}</span>
                                  <span>{formatCurrency(item.cost, item.currency)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transport View */}
            {view === 'transport' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Transport Options</h3>
                  
                  <div className="space-y-4">
                    {transportOptions.map((option) => (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              {React.createElement(getTransportIcon(option.type), {
                                className: 'w-6 h-6 text-blue-600'
                              })}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{option.provider}</h4>
                                {option.isAccessible && (
                                  <Accessibility className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span>{option.departure} → {option.arrival}</span>
                                <span>{formatTime(option.departureTime)} - {formatTime(option.arrivalTime)}</span>
                                <span>{formatDuration(option.duration)}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {option.accessibilityFeatures.map((feature) => (
                                  <span key={feature} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 mb-1">
                              {formatCurrency(option.price, option.currency)}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              {option.carbonFootprint}kg CO₂
                            </p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Book
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Accommodation View */}
            {view === 'accommodation' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Accommodation Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accommodations.map((accommodation) => (
                      <motion.div
                        key={accommodation.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="relative">
                          <img
                            src={accommodation.images[0]}
                            alt={accommodation.name}
                            className="w-full h-48 object-cover"
                          />
                          {accommodation.isAccessible && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                              <Accessibility className="w-4 h-4 inline mr-1" />
                              Accessible
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{accommodation.name}</h4>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{accommodation.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{accommodation.address}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {accommodation.amenities.slice(0, 3).map((amenity) => (
                              <span key={amenity} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(accommodation.price, accommodation.currency)}/night
                            </span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Book Now
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

export default EventsAndTravel;
