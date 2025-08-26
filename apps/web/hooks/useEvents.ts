'use client';

import { useState, useCallback } from 'react';

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
  isCompleted?: boolean;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const createEvent = useCallback(async (eventData: Omit<Event, 'id'>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString()
      };

      setEvents(prev => [...prev, newEvent]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates }
          : event
      )
    );
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const markEventComplete = useCallback(async (eventId: string) => {
    updateEvent(eventId, { isCompleted: true });
  }, [updateEvent]);

  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events
      .filter(event => event.startDate > now && !event.isCompleted)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events]);

  const createItinerary = useCallback(async (itineraryData: any) => {
    // Mock implementation
    console.log('Creating itinerary:', itineraryData);
  }, []);

  const bookEvent = useCallback(async (eventId: string) => {
    // Mock implementation
    console.log('Booking event:', eventId);
  }, []);

  const getRecommendations = useCallback(async () => {
    // Mock implementation
    return [];
  }, []);

  const bookmarkEvent = useCallback(async (eventId: string) => {
    // Mock implementation
    console.log('Bookmarking event:', eventId);
  }, []);

  return {
    events,
    itineraries,
    recommendations,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    getUpcomingEvents,
    createItinerary,
    bookEvent,
    bookmarkEvent,
    getRecommendations
  };
};
