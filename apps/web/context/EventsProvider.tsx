import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: 'meeting' | 'appointment' | 'reminder' | 'birthday' | 'holiday' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  attendees: string[];
  tags: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  events: Event[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventsContextType {
  events: Event[];
  setEvents: (events: Event[]) => void;
  calendars: Calendar[];
  setCalendars: (calendars: Calendar[]) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createCalendar: (calendar: Omit<Calendar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Calendar>;
  updateCalendar: (calendarId: string, updates: Partial<Calendar>) => Promise<void>;
  deleteCalendar: (calendarId: string) => Promise<void>;
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];
  getUpcomingEvents: (limit?: number) => Event[];
  exportCalendar: (calendarId: string, format: 'ics' | 'json') => Promise<string>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent: Event = {
        ...event,
        id: `event-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, ...updates, updatedAt: new Date() }
            : event
        )
      );
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCalendar = useCallback(async (calendar: Omit<Calendar, 'id' | 'createdAt' | 'updatedAt'>): Promise<Calendar> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCalendar: Calendar = {
        ...calendar,
        id: `calendar-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setCalendars(prev => [...prev, newCalendar]);
      return newCalendar;
    } catch (error) {
      console.error('Failed to create calendar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCalendar = useCallback(async (calendarId: string, updates: Partial<Calendar>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCalendars(prev =>
        prev.map(calendar =>
          calendar.id === calendarId
            ? { ...calendar, ...updates, updatedAt: new Date() }
            : calendar
        )
      );
    } catch (error) {
      console.error('Failed to update calendar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCalendar = useCallback(async (calendarId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCalendars(prev => prev.filter(calendar => calendar.id !== calendarId));
    } catch (error) {
      console.error('Failed to delete calendar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventsForDate = useCallback((date: Date): Event[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  }, [events]);

  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date): Event[] => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }, [events]);

  const getUpcomingEvents = useCallback((limit = 10): Event[] => {
    const now = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return upcomingEvents.slice(0, limit);
  }, [events]);

  const exportCalendar = useCallback(async (calendarId: string, format: 'ics' | 'json'): Promise<string> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const calendar = calendars.find(c => c.id === calendarId);
      if (!calendar) throw new Error('Calendar not found');
      
      if (format === 'json') {
        return JSON.stringify(calendar, null, 2);
      } else {
        // Generate ICS format
        let ics = 'BEGIN:VCALENDAR\r\n';
        ics += 'VERSION:2.0\r\n';
        ics += 'PRODID:-//CareConnect//Calendar//EN\r\n';
        
        calendar.events.forEach(event => {
          ics += 'BEGIN:VEVENT\r\n';
          ics += `UID:${event.id}\r\n`;
          ics += `DTSTART:${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
          ics += `DTEND:${event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
          ics += `SUMMARY:${event.title}\r\n`;
          ics += `DESCRIPTION:${event.description}\r\n`;
          ics += `LOCATION:${event.location}\r\n`;
          ics += 'END:VEVENT\r\n';
        });
        
        ics += 'END:VCALENDAR\r\n';
        return ics;
      }
    } catch (error) {
      console.error('Failed to export calendar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [calendars]);

  const value: EventsContextType = {
    events,
    setEvents,
    calendars,
    setCalendars,
    selectedDate,
    setSelectedDate,
    isLoading,
    setIsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    getEventsForDate,
    getEventsForDateRange,
    getUpcomingEvents,
    exportCalendar,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

