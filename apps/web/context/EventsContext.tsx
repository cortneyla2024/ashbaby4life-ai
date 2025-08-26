'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  type: 'personal' | 'work' | 'health' | 'social' | 'education' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  recurrencePattern?: string;
  attendees?: string[];
  reminders: Reminder[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Reminder {
  id: string;
  eventId: string;
  time: Date;
  type: 'notification' | 'email' | 'sms';
  isSent: boolean;
}

interface Calendar {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  events: Event[];
}

interface EventsState {
  events: Event[];
  calendars: Calendar[];
  selectedDate: Date;
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    types: string[];
    priorities: string[];
    calendars: string[];
    dateRange: { start: Date | null; end: Date | null };
  };
}

type EventsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_CALENDARS'; payload: Calendar[] }
  | { type: 'ADD_CALENDAR'; payload: Calendar }
  | { type: 'UPDATE_CALENDAR'; payload: Calendar }
  | { type: 'DELETE_CALENDAR'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_SELECTED_EVENT'; payload: Event | null }
  | { type: 'SET_FILTERS'; payload: Partial<EventsState['filters']> }
  | { type: 'ADD_REMINDER'; payload: { eventId: string; reminder: Reminder } }
  | { type: 'UPDATE_REMINDER'; payload: { eventId: string; reminder: Reminder } }
  | { type: 'DELETE_REMINDER'; payload: { eventId: string; reminderId: string } };

// Initial state
const initialState: EventsState = {
  events: [],
  calendars: [
    {
      id: 'default',
      name: 'Default Calendar',
      color: '#3B82F6',
      isDefault: true,
      events: [],
    },
  ],
  selectedDate: new Date(),
  selectedEvent: null,
  isLoading: false,
  error: null,
  filters: {
    types: [],
    priorities: [],
    calendars: [],
    dateRange: { start: null, end: null },
  },
};

// Reducer
function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'SET_CALENDARS':
      return { ...state, calendars: action.payload };
    case 'ADD_CALENDAR':
      return { ...state, calendars: [...state.calendars, action.payload] };
    case 'UPDATE_CALENDAR':
      return {
        ...state,
        calendars: state.calendars.map((calendar) =>
          calendar.id === action.payload.id ? action.payload : calendar
        ),
      };
    case 'DELETE_CALENDAR':
      return {
        ...state,
        calendars: state.calendars.filter((calendar) => calendar.id !== action.payload),
      };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'ADD_REMINDER':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.eventId
            ? { ...event, reminders: [...event.reminders, action.payload.reminder] }
            : event
        ),
      };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.eventId
            ? {
                ...event,
                reminders: event.reminders.map((reminder) =>
                  reminder.id === action.payload.reminder.id
                    ? action.payload.reminder
                    : reminder
                ),
              }
            : event
        ),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.eventId
            ? {
                ...event,
                reminders: event.reminders.filter(
                  (reminder) => reminder.id !== action.payload.reminderId
                ),
              }
            : event
        ),
      };
    default:
      return state;
  }
}

// Context
interface EventsContextType {
  state: EventsState;
  dispatch: React.Dispatch<EventsAction>;
  // Event actions
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  getEventsByDate: (date: Date) => Event[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => Event[];
  getUpcomingEvents: (days?: number) => Event[];
  // Calendar actions
  createCalendar: (calendarData: Omit<Calendar, 'id' | 'events'>) => Promise<void>;
  updateCalendar: (id: string, calendarData: Partial<Calendar>) => Promise<void>;
  deleteCalendar: (id: string) => Promise<void>;
  getCalendar: (id: string) => Calendar | undefined;
  // Reminder actions
  addReminder: (eventId: string, reminderData: Omit<Reminder, 'id' | 'isSent'>) => Promise<void>;
  updateReminder: (eventId: string, reminderId: string, reminderData: Partial<Reminder>) => Promise<void>;
  deleteReminder: (eventId: string, reminderId: string) => Promise<void>;
  // Utility actions
  setSelectedDate: (date: Date) => void;
  setSelectedEvent: (event: Event | null) => void;
  setFilters: (filters: Partial<EventsState['filters']>) => void;
  clearFilters: () => void;
  exportEvents: (format: 'ics' | 'json' | 'csv') => Promise<string>;
  importEvents: (data: string, format: 'ics' | 'json' | 'csv') => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Provider
export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, initialState);

  // Load events from localStorage on mount
  useEffect(() => {
    const loadEvents = () => {
      try {
        const savedEvents = localStorage.getItem('careconnect_events');
        const savedCalendars = localStorage.getItem('careconnect_calendars');
        
        if (savedEvents) {
          const events = JSON.parse(savedEvents).map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
            reminders: event.reminders.map((reminder: any) => ({
              ...reminder,
              time: new Date(reminder.time),
            })),
          }));
          dispatch({ type: 'SET_EVENTS', payload: events });
        }
        
        if (savedCalendars) {
          const calendars = JSON.parse(savedCalendars);
          dispatch({ type: 'SET_CALENDARS', payload: calendars });
        }
      } catch (error) {
        console.error('Error loading events:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load events' });
      }
    };

    loadEvents();
  }, []);

  // Save events to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('careconnect_events', JSON.stringify(state.events));
  }, [state.events]);

  useEffect(() => {
    localStorage.setItem('careconnect_calendars', JSON.stringify(state.calendars));
  }, [state.calendars]);

  // Event actions
  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newEvent: Event = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error creating event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create event' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const event = state.events.find((e) => e.id === id);
      if (!event) {
        throw new Error('Event not found');
      }
      
      const updatedEvent: Event = {
        ...event,
        ...eventData,
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update event' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_EVENT', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete event' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getEvent = (id: string) => {
    return state.events.find((event) => event.id === id);
  };

  const getEventsByDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return state.events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  };

  const getEventsByDateRange = (startDate: Date, endDate: Date) => {
    return state.events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= endDate && eventEnd >= startDate;
    });
  };

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return state.events
      .filter((event) => {
        const eventStart = new Date(event.startDate);
        return eventStart >= now && eventStart <= futureDate;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  // Calendar actions
  const createCalendar = async (calendarData: Omit<Calendar, 'id' | 'events'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newCalendar: Calendar = {
        ...calendarData,
        id: `calendar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        events: [],
      };
      
      dispatch({ type: 'ADD_CALENDAR', payload: newCalendar });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error creating calendar:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create calendar' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCalendar = async (id: string, calendarData: Partial<Calendar>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const calendar = state.calendars.find((c) => c.id === id);
      if (!calendar) {
        throw new Error('Calendar not found');
      }
      
      const updatedCalendar: Calendar = {
        ...calendar,
        ...calendarData,
      };
      
      dispatch({ type: 'UPDATE_CALENDAR', payload: updatedCalendar });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating calendar:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update calendar' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCalendar = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_CALENDAR', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting calendar:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete calendar' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getCalendar = (id: string) => {
    return state.calendars.find((calendar) => calendar.id === id);
  };

  // Reminder actions
  const addReminder = async (eventId: string, reminderData: Omit<Reminder, 'id' | 'isSent'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newReminder: Reminder = {
        ...reminderData,
        id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isSent: false,
      };
      
      dispatch({ type: 'ADD_REMINDER', payload: { eventId, reminder: newReminder } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error adding reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add reminder' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateReminder = async (eventId: string, reminderId: string, reminderData: Partial<Reminder>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const event = state.events.find((e) => e.id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      const reminder = event.reminders.find((r) => r.id === reminderId);
      if (!reminder) {
        throw new Error('Reminder not found');
      }
      
      const updatedReminder: Reminder = {
        ...reminder,
        ...reminderData,
      };
      
      dispatch({ type: 'UPDATE_REMINDER', payload: { eventId, reminder: updatedReminder } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update reminder' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteReminder = async (eventId: string, reminderId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_REMINDER', payload: { eventId, reminderId } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete reminder' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Utility actions
  const setSelectedDate = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const setSelectedEvent = (event: Event | null) => {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event });
  };

  const setFilters = (filters: Partial<EventsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        types: [],
        priorities: [],
        calendars: [],
        dateRange: { start: null, end: null },
      },
    });
  };

  const exportEvents = async (format: 'ics' | 'json' | 'csv'): Promise<string> => {
    try {
      switch (format) {
        case 'json':
          return JSON.stringify(state.events, null, 2);
        case 'csv':
          const csvHeader = 'Title,Description,Start Date,End Date,Location,Type,Priority\n';
          const csvRows = state.events.map((event) =>
            `"${event.title}","${event.description || ''}","${event.startDate.toISOString()}","${event.endDate.toISOString()}","${event.location || ''}","${event.type}","${event.priority}"`
          ).join('\n');
          return csvHeader + csvRows;
        case 'ics':
          // Simple ICS format implementation
          const icsContent = state.events.map((event) => {
            return `BEGIN:VEVENT
UID:${event.id}
DTSTART:${event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT`;
          }).join('\n');
          return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareConnect//Events//EN
${icsContent}
END:VCALENDAR`;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting events:', error);
      throw new Error('Failed to export events');
    }
  };

  const importEvents = async (data: string, format: 'ics' | 'json' | 'csv'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let events: any[] = [];
      
      switch (format) {
        case 'json':
          events = JSON.parse(data);
          break;
        case 'csv':
          const lines = data.split('\n');
          const headers = lines[0].split(',');
          events = lines.slice(1).map((line) => {
            const values = line.split(',');
            return {
              title: values[0]?.replace(/"/g, ''),
              description: values[1]?.replace(/"/g, ''),
              startDate: new Date(values[2]?.replace(/"/g, '')),
              endDate: new Date(values[3]?.replace(/"/g, '')),
              location: values[4]?.replace(/"/g, ''),
              type: values[5]?.replace(/"/g, '') || 'personal',
              priority: values[6]?.replace(/"/g, '') || 'medium',
              isRecurring: false,
              reminders: [],
              tags: [],
            };
          });
          break;
        case 'ics':
          // Simple ICS parsing implementation
          const eventBlocks = data.split('BEGIN:VEVENT');
          events = eventBlocks.slice(1).map((block) => {
            const lines = block.split('\n');
            const event: any = {};
            
            lines.forEach((line) => {
              if (line.startsWith('SUMMARY:')) {
                event.title = line.substring(8);
              } else if (line.startsWith('DESCRIPTION:')) {
                event.description = line.substring(12);
              } else if (line.startsWith('LOCATION:')) {
                event.location = line.substring(9);
              } else if (line.startsWith('DTSTART:')) {
                const dateStr = line.substring(8).replace('Z', '');
                event.startDate = new Date(
                  `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}Z`
                );
              } else if (line.startsWith('DTEND:')) {
                const dateStr = line.substring(6).replace('Z', '');
                event.endDate = new Date(
                  `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}T${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}Z`
                );
              }
            });
            
            return {
              ...event,
              type: 'personal',
              priority: 'medium',
              isRecurring: false,
              reminders: [],
              tags: [],
            };
          });
          break;
        default:
          throw new Error('Unsupported import format');
      }
      
      // Create events from imported data
      for (const eventData of events) {
        await createEvent(eventData);
      }
      
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error importing events:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import events' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: EventsContextType = {
    state,
    dispatch,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventsByDate,
    getEventsByDateRange,
    getUpcomingEvents,
    createCalendar,
    updateCalendar,
    deleteCalendar,
    getCalendar,
    addReminder,
    updateReminder,
    deleteReminder,
    setSelectedDate,
    setSelectedEvent,
    setFilters,
    clearFilters,
    exportEvents,
    importEvents,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

// Hook
export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
