'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Star, Search, Filter, Plus,
  Heart, Share, Download, Settings, Navigation, Car, Train,
  Plane, Bus, Hotel, Camera, Map, Route, Compass, Globe,
  TrendingUp, CalendarDays, Clock3, UserCheck, MapPinned
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/hooks/useNotifications';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  organizer: {
    name: string;
    avatar: string;
    rating: number;
  };
  price: number;
  currency: string;
  capacity: number;
  attendees: number;
  isOnline: boolean;
  tags: string[];
  image?: string;
  isBookmarked: boolean;
  isRegistered: boolean;
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  events: ItineraryEvent[];
  transport: TransportInfo[];
  accommodation: AccommodationInfo;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  isPublic: boolean;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ItineraryEvent {
  id: string;
  eventId?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: 'event' | 'activity' | 'meal' | 'transport' | 'rest';
  notes?: string;
  isBooked: boolean;
}

interface TransportInfo {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'walking' | 'bike';
  from: string;
  to: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  price: number;
  currency: string;
  provider: string;
  bookingReference?: string;
  status: 'booked' | 'pending' | 'cancelled';
}

interface AccommodationInfo {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'camping';
  address: string;
  checkIn: Date;
  checkOut: Date;
  price: number;
  currency: string;
  rating: number;
  amenities: string[];
  bookingReference?: string;
  status: 'booked' | 'pending' | 'cancelled';
}

interface TravelRecommendation {
  id: string;
  destination: string;
  description: string;
  image: string;
  rating: number;
  priceRange: 'budget' | 'mid-range' | 'luxury';
  duration: number; // in days
  bestTime: string;
  highlights: string[];
  isBookmarked: boolean;
}

export const EventsHub: React.FC = () => {
  const { user } = useAuth();
  const {
    events,
    itineraries,
    recommendations,
    createItinerary,
    bookEvent,
    bookmarkEvent,
    loading
  } = useEvents();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'events' | 'itineraries' | 'recommendations' | 'transport'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date());
  const registeredEvents = events.filter(e => e.isRegistered);
  const bookmarkedEvents = events.filter(e => e.isBookmarked);
  const totalItineraries = itineraries.length;

  const handleBookEvent = useCallback(async (eventId: string) => {
    try {
      await bookEvent(eventId);
      addNotification({ type: 'success', title: 'Event booked successfully!', message: 'Your event has been booked' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to book event', message: 'There was an error booking the event' });
    }
  }, [bookEvent, addNotification]);

  const handleBookmarkEvent = useCallback(async (eventId: string) => {
    try {
      await bookmarkEvent(eventId);
      addNotification({ type: 'success', title: 'Event bookmarked!', message: 'Event has been bookmarked' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to bookmark event', message: 'There was an error bookmarking the event' });
    }
  }, [bookmarkEvent, addNotification]);

  const handleCreateItinerary = useCallback(async (itinerary: Partial<Itinerary>) => {
    try {
      await createItinerary(itinerary as Itinerary);
      setShowCreateModal(false);
      addNotification({ type: 'success', title: 'Itinerary created successfully!', message: 'Your itinerary has been created' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to create itinerary', message: 'There was an error creating the itinerary' });
    }
  }, [createItinerary, addNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Events & Travel
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover events, plan trips, and explore the world
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Events</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {upcomingEvents.length}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600 dark:text-blue-400">This month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Registered</h3>
            <UserCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {registeredEvents.length}
          </p>
          <div className="flex items-center mt-2">
            <CalendarDays className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 dark:text-green-400">Your events</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Itineraries</h3>
            <Map className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalItineraries}
          </p>
          <div className="flex items-center mt-2">
            <Route className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm text-purple-600 dark:text-purple-400">Planned trips</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookmarked</h3>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {bookmarkedEvents.length}
          </p>
          <div className="flex items-center mt-2">
            <Star className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600 dark:text-red-400">Saved events</span>
          </div>
        </motion.div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events, destinations, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Itinerary
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'events', label: 'Events', icon: Calendar, count: filteredEvents.length },
            { id: 'itineraries', label: 'Itineraries', icon: Map, count: itineraries.length },
            { id: 'recommendations', label: 'Travel', icon: Globe, count: recommendations.length },
            { id: 'transport', label: 'Transport', icon: Navigation, count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria or browse all events
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.image && (
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          {event.isOnline && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                              Online
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmarkEvent(event.id);
                            }}
                            className={`p-1 rounded-full ${
                              event.isBookmarked
                                ? 'bg-red-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{event.location.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={event.organizer.avatar}
                            alt={event.organizer.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {event.organizer.name}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {event.organizer.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {event.price === 0 ? 'Free' : `${event.currency}${event.price}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {event.attendees}/{event.capacity} attending
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {event.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookEvent(event.id);
                          }}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${
                            event.isRegistered
                              ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
                              : 'text-white bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {event.isRegistered ? 'Registered' : 'Register'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'itineraries' && (
            <div className="space-y-6">
              {itineraries.length === 0 ? (
                <div className="text-center py-12">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No itineraries yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your first itinerary to start planning your next adventure
                  </p>
                </div>
              ) : (
                itineraries.map((itinerary) => (
                  <motion.div
                    key={itinerary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{itinerary.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {itinerary.budget.currency}${itinerary.budget.spent.toFixed(0)} / {itinerary.budget.total.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {itinerary.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{itinerary.destination}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{itinerary.events.length} activities</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{itinerary.collaborators.length} collaborators</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {itinerary.isPublic && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                            Public
                          </span>
                        )}
                        <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recommendations yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete your profile to get personalized travel recommendations
                  </p>
                </div>
              ) : (
                recommendations.map((recommendation) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      <img
                        src={recommendation.image}
                        alt={recommendation.destination}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleBookmarkEvent(recommendation.id)}
                          className={`p-1 rounded-full ${
                            recommendation.isBookmarked
                              ? 'bg-red-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {recommendation.destination}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {recommendation.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {recommendation.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          recommendation.priceRange === 'budget' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          recommendation.priceRange === 'mid-range' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {recommendation.priceRange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{recommendation.duration} days</span>
                        <span>Best: {recommendation.bestTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {recommendation.highlights.slice(0, 3).map((highlight) => (
                          <span
                            key={highlight}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md">
                        Plan Trip
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="text-center py-12">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Transport Planning</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Plan your transportation for upcoming trips and events
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: Plane, label: 'Flights', color: 'text-blue-500' },
                  { icon: Train, label: 'Trains', color: 'text-green-500' },
                  { icon: Bus, label: 'Buses', color: 'text-purple-500' },
                  { icon: Car, label: 'Car Rental', color: 'text-orange-500' }
                ].map((transport) => (
                  <div key={transport.label} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <transport.icon className={`w-8 h-8 ${transport.color} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{transport.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
