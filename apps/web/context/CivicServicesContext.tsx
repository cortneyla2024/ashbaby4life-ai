'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface CivicService {
  id: string;
  name: string;
  description: string;
  category: 'health' | 'education' | 'housing' | 'employment' | 'legal' | 'transportation' | 'utilities' | 'emergency';
  type: 'government' | 'nonprofit' | 'community' | 'private';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    hours: string;
  };
  eligibility: {
    age?: { min: number; max: number };
    income?: { min: number; max: number };
    residency: string[];
    requirements: string[];
  };
  services: string[];
  documents: string[];
  status: 'active' | 'inactive' | 'temporary';
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GovernmentResource {
  id: string;
  title: string;
  description: string;
  category: 'forms' | 'information' | 'guidelines' | 'regulations' | 'benefits';
  agency: string;
  url: string;
  fileType: 'pdf' | 'doc' | 'html' | 'video' | 'audio';
  fileSize?: number;
  language: string[];
  tags: string[];
  lastUpdated: Date;
  isFree: boolean;
  requiresAuth: boolean;
}

interface LocalAlert {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'weather' | 'traffic' | 'safety' | 'health' | 'utility' | 'general';
  location: {
    city: string;
    state: string;
    affectedAreas: string[];
  };
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  source: string;
  actions: string[];
  createdAt: Date;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: 'meeting' | 'workshop' | 'celebration' | 'protest' | 'volunteer' | 'educational';
  organizer: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: { lat: number; lng: number };
  };
  dateTime: {
    start: Date;
    end: Date;
  };
  isVirtual: boolean;
  virtualUrl?: string;
  attendees: number;
  maxAttendees?: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
}

interface CivicServicesState {
  services: CivicService[];
  resources: GovernmentResource[];
  alerts: LocalAlert[];
  events: CommunityEvent[];
  userLocation: {
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  } | null;
  favorites: {
    services: string[];
    resources: string[];
    events: string[];
  };
  isLoading: boolean;
  error: string | null;
  settings: {
    notificationsEnabled: boolean;
    alertTypes: string[];
    maxDistance: number;
    language: string;
    accessibility: boolean;
  };
}

type CivicServicesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SERVICES'; payload: CivicService[] }
  | { type: 'ADD_SERVICE'; payload: CivicService }
  | { type: 'UPDATE_SERVICE'; payload: CivicService }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'SET_RESOURCES'; payload: GovernmentResource[] }
  | { type: 'ADD_RESOURCE'; payload: GovernmentResource }
  | { type: 'UPDATE_RESOURCE'; payload: GovernmentResource }
  | { type: 'REMOVE_RESOURCE'; payload: string }
  | { type: 'SET_ALERTS'; payload: LocalAlert[] }
  | { type: 'ADD_ALERT'; payload: LocalAlert }
  | { type: 'UPDATE_ALERT'; payload: LocalAlert }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'SET_EVENTS'; payload: CommunityEvent[] }
  | { type: 'ADD_EVENT'; payload: CommunityEvent }
  | { type: 'UPDATE_EVENT'; payload: CommunityEvent }
  | { type: 'REMOVE_EVENT'; payload: string }
  | { type: 'SET_USER_LOCATION'; payload: CivicServicesState['userLocation'] }
  | { type: 'ADD_FAVORITE'; payload: { type: 'services' | 'resources' | 'events'; id: string } }
  | { type: 'REMOVE_FAVORITE'; payload: { type: 'services' | 'resources' | 'events'; id: string } }
  | { type: 'SET_SETTINGS'; payload: Partial<CivicServicesState['settings']> };

// Initial state
const initialState: CivicServicesState = {
  services: [],
  resources: [],
  alerts: [],
  events: [],
  userLocation: null,
  favorites: {
    services: [],
    resources: [],
    events: [],
  },
  isLoading: false,
  error: null,
  settings: {
    notificationsEnabled: true,
    alertTypes: ['emergency', 'warning', 'info'],
    maxDistance: 50, // miles
    language: 'en',
    accessibility: false,
  },
};

// Reducer
function civicServicesReducer(state: CivicServicesState, action: CivicServicesAction): CivicServicesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map((service) =>
          service.id === action.payload.id ? action.payload : service
        ),
      };
    case 'REMOVE_SERVICE':
      return {
        ...state,
        services: state.services.filter((service) => service.id !== action.payload),
      };
    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };
    case 'ADD_RESOURCE':
      return { ...state, resources: [...state.resources, action.payload] };
    case 'UPDATE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map((resource) =>
          resource.id === action.payload.id ? action.payload : resource
        ),
      };
    case 'REMOVE_RESOURCE':
      return {
        ...state,
        resources: state.resources.filter((resource) => resource.id !== action.payload),
      };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.payload] };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        ),
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
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
    case 'REMOVE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          [action.payload.type]: [...state.favorites[action.payload.type], action.payload.id],
        },
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: {
          ...state.favorites,
          [action.payload.type]: state.favorites[action.payload.type].filter(
            (id) => id !== action.payload.id
          ),
        },
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context
interface CivicServicesContextType {
  state: CivicServicesState;
  dispatch: React.Dispatch<CivicServicesAction>;
  // Service management
  searchServices: (query: string, filters?: Record<string, any>) => CivicService[];
  getService: (id: string) => CivicService | undefined;
  addService: (service: Omit<CivicService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (id: string, updates: Partial<CivicService>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  // Resource management
  searchResources: (query: string, filters?: Record<string, any>) => GovernmentResource[];
  getResource: (id: string) => GovernmentResource | undefined;
  addResource: (resource: Omit<GovernmentResource, 'id'>) => Promise<void>;
  updateResource: (id: string, updates: Partial<GovernmentResource>) => Promise<void>;
  removeResource: (id: string) => Promise<void>;
  // Alert management
  getActiveAlerts: () => LocalAlert[];
  getAlert: (id: string) => LocalAlert | undefined;
  addAlert: (alert: Omit<LocalAlert, 'id' | 'createdAt'>) => Promise<void>;
  updateAlert: (id: string, updates: Partial<LocalAlert>) => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  // Event management
  searchEvents: (query: string, filters?: Record<string, any>) => CommunityEvent[];
  getEvent: (id: string) => CommunityEvent | undefined;
  addEvent: (event: Omit<CommunityEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CommunityEvent>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  // Location management
  setUserLocation: (location: CivicServicesState['userLocation']) => void;
  getNearbyServices: (radius?: number) => CivicService[];
  // Favorites management
  addToFavorites: (type: 'services' | 'resources' | 'events', id: string) => void;
  removeFromFavorites: (type: 'services' | 'resources' | 'events', id: string) => void;
  isFavorite: (type: 'services' | 'resources' | 'events', id: string) => boolean;
  // Utility
  exportData: (type: 'services' | 'resources' | 'alerts' | 'events', format: 'json' | 'csv') => Promise<string>;
  importData: (type: 'services' | 'resources' | 'alerts' | 'events', data: string, format: 'json' | 'csv') => Promise<void>;
}

const CivicServicesContext = createContext<CivicServicesContextType | undefined>(undefined);

// Provider
export function CivicServicesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(civicServicesReducer, initialState);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('careconnect_civic_settings');
        const savedFavorites = localStorage.getItem('careconnect_civic_favorites');
        const savedLocation = localStorage.getItem('careconnect_user_location');
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        }
        
        if (savedFavorites) {
          const favorites = JSON.parse(savedFavorites);
          Object.entries(favorites).forEach(([type, ids]) => {
            (ids as string[]).forEach((id) => {
              dispatch({ type: 'ADD_FAVORITE', payload: { type: type as any, id } });
            });
          });
        }
        
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          dispatch({ type: 'SET_USER_LOCATION', payload: location });
        }
      } catch (error) {
        console.error('Error loading civic services settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('careconnect_civic_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem('careconnect_civic_favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  useEffect(() => {
    if (state.userLocation) {
      localStorage.setItem('careconnect_user_location', JSON.stringify(state.userLocation));
    }
  }, [state.userLocation]);

  // Service management
  const searchServices = (query: string, filters?: Record<string, any>): CivicService[] => {
    let results = state.services;

    // Search by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((service) =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        service.services.some((s) => s.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter((service) => service.category === filters.category);
      }
      if (filters.type) {
        results = results.filter((service) => service.type === filters.type);
      }
      if (filters.city) {
        results = results.filter((service) => 
          service.location.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      if (filters.status) {
        results = results.filter((service) => service.status === filters.status);
      }
    }

    return results;
  };

  const getService = (id: string) => {
    return state.services.find((service) => service.id === id);
  };

  const addService = async (service: Omit<CivicService, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newService: CivicService = {
        ...service,
        id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_SERVICE', payload: newService });
    } catch (error) {
      console.error('Error adding service:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add service' });
    }
  };

  const updateService = async (id: string, updates: Partial<CivicService>) => {
    try {
      const service = state.services.find((s) => s.id === id);
      if (!service) {
        throw new Error('Service not found');
      }

      const updatedService = { ...service, ...updates, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_SERVICE', payload: updatedService });
    } catch (error) {
      console.error('Error updating service:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update service' });
    }
  };

  const removeService = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_SERVICE', payload: id });
    } catch (error) {
      console.error('Error removing service:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove service' });
    }
  };

  // Resource management
  const searchResources = (query: string, filters?: Record<string, any>): GovernmentResource[] => {
    let results = state.resources;

    // Search by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((resource) =>
        resource.title.toLowerCase().includes(lowerQuery) ||
        resource.description.toLowerCase().includes(lowerQuery) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter((resource) => resource.category === filters.category);
      }
      if (filters.agency) {
        results = results.filter((resource) => 
          resource.agency.toLowerCase().includes(filters.agency.toLowerCase())
        );
      }
      if (filters.fileType) {
        results = results.filter((resource) => resource.fileType === filters.fileType);
      }
      if (filters.isFree !== undefined) {
        results = results.filter((resource) => resource.isFree === filters.isFree);
      }
    }

    return results;
  };

  const getResource = (id: string) => {
    return state.resources.find((resource) => resource.id === id);
  };

  const addResource = async (resource: Omit<GovernmentResource, 'id'>) => {
    try {
      const newResource: GovernmentResource = {
        ...resource,
        id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      dispatch({ type: 'ADD_RESOURCE', payload: newResource });
    } catch (error) {
      console.error('Error adding resource:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add resource' });
    }
  };

  const updateResource = async (id: string, updates: Partial<GovernmentResource>) => {
    try {
      const resource = state.resources.find((r) => r.id === id);
      if (!resource) {
        throw new Error('Resource not found');
      }

      const updatedResource = { ...resource, ...updates };
      dispatch({ type: 'UPDATE_RESOURCE', payload: updatedResource });
    } catch (error) {
      console.error('Error updating resource:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update resource' });
    }
  };

  const removeResource = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_RESOURCE', payload: id });
    } catch (error) {
      console.error('Error removing resource:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove resource' });
    }
  };

  // Alert management
  const getActiveAlerts = () => {
    return state.alerts.filter((alert) => alert.isActive);
  };

  const getAlert = (id: string) => {
    return state.alerts.find((alert) => alert.id === id);
  };

  const addAlert = async (alert: Omit<LocalAlert, 'id' | 'createdAt'>) => {
    try {
      const newAlert: LocalAlert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_ALERT', payload: newAlert });
    } catch (error) {
      console.error('Error adding alert:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add alert' });
    }
  };

  const updateAlert = async (id: string, updates: Partial<LocalAlert>) => {
    try {
      const alert = state.alerts.find((a) => a.id === id);
      if (!alert) {
        throw new Error('Alert not found');
      }

      const updatedAlert = { ...alert, ...updates };
      dispatch({ type: 'UPDATE_ALERT', payload: updatedAlert });
    } catch (error) {
      console.error('Error updating alert:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update alert' });
    }
  };

  const removeAlert = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_ALERT', payload: id });
    } catch (error) {
      console.error('Error removing alert:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove alert' });
    }
  };

  // Event management
  const searchEvents = (query: string, filters?: Record<string, any>): CommunityEvent[] => {
    let results = state.events;

    // Search by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter((event) => event.category === filters.category);
      }
      if (filters.city) {
        results = results.filter((event) => 
          event.location.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      if (filters.isVirtual !== undefined) {
        results = results.filter((event) => event.isVirtual === filters.isVirtual);
      }
      if (filters.isPublic !== undefined) {
        results = results.filter((event) => event.isPublic === filters.isPublic);
      }
    }

    return results;
  };

  const getEvent = (id: string) => {
    return state.events.find((event) => event.id === id);
  };

  const addEvent = async (event: Omit<CommunityEvent, 'id' | 'createdAt'>) => {
    try {
      const newEvent: CommunityEvent = {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_EVENT', payload: newEvent });
    } catch (error) {
      console.error('Error adding event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add event' });
    }
  };

  const updateEvent = async (id: string, updates: Partial<CommunityEvent>) => {
    try {
      const event = state.events.find((e) => e.id === id);
      if (!event) {
        throw new Error('Event not found');
      }

      const updatedEvent = { ...event, ...updates };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
    } catch (error) {
      console.error('Error updating event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update event' });
    }
  };

  const removeEvent = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_EVENT', payload: id });
    } catch (error) {
      console.error('Error removing event:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove event' });
    }
  };

  // Location management
  const setUserLocation = (location: CivicServicesState['userLocation']) => {
    dispatch({ type: 'SET_USER_LOCATION', payload: location });
  };

  const getNearbyServices = (radius: number = 50): CivicService[] => {
    if (!state.userLocation?.coordinates) {
      return state.services;
    }

    // Simple distance calculation (in a real app, you'd use a proper geolocation library)
    return state.services.filter((service) => {
      if (!service.location.coordinates) return false;
      
      const lat1 = state.userLocation!.coordinates!.lat;
      const lng1 = state.userLocation!.coordinates!.lng;
      const lat2 = service.location.coordinates.lat;
      const lng2 = service.location.coordinates.lng;
      
      const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 69; // Rough miles conversion
      return distance <= radius;
    });
  };

  // Favorites management
  const addToFavorites = (type: 'services' | 'resources' | 'events', id: string) => {
    dispatch({ type: 'ADD_FAVORITE', payload: { type, id } });
  };

  const removeFromFavorites = (type: 'services' | 'resources' | 'events', id: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: { type, id } });
  };

  const isFavorite = (type: 'services' | 'resources' | 'events', id: string) => {
    return state.favorites[type].includes(id);
  };

  // Utility
  const exportData = async (type: 'services' | 'resources' | 'alerts' | 'events', format: 'json' | 'csv'): Promise<string> => {
    try {
      let data: any[] = [];
      
      switch (type) {
        case 'services':
          data = state.services;
          break;
        case 'resources':
          data = state.resources;
          break;
        case 'alerts':
          data = state.alerts;
          break;
        case 'events':
          data = state.events;
          break;
      }

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Simple CSV conversion
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]).filter(key => key !== 'id');
        const csvRows = [headers.join(',')];
        
        data.forEach((item) => {
          const row = headers.map(header => {
            const value = item[header];
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return value;
          });
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  };

  const importData = async (type: 'services' | 'resources' | 'alerts' | 'events', data: string, format: 'json' | 'csv'): Promise<void> => {
    try {
      let parsedData: any[] = [];
      
      if (format === 'json') {
        parsedData = JSON.parse(data);
      } else {
        // Simple CSV parsing
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        parsedData = lines.slice(1).map((line) => {
          const values = line.split(',');
          const item: any = {};
          headers.forEach((header, index) => {
            item[header] = values[index];
          });
          return item;
        });
      }

      // Add data based on type
      switch (type) {
        case 'services':
          for (const item of parsedData) {
            await addService(item);
          }
          break;
        case 'resources':
          for (const item of parsedData) {
            await addResource(item);
          }
          break;
        case 'alerts':
          for (const item of parsedData) {
            await addAlert(item);
          }
          break;
        case 'events':
          for (const item of parsedData) {
            await addEvent(item);
          }
          break;
      }
    } catch (error) {
      console.error('Error importing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data' });
    }
  };

  const value: CivicServicesContextType = {
    state,
    dispatch,
    searchServices,
    getService,
    addService,
    updateService,
    removeService,
    searchResources,
    getResource,
    addResource,
    updateResource,
    removeResource,
    getActiveAlerts,
    getAlert,
    addAlert,
    updateAlert,
    removeAlert,
    searchEvents,
    getEvent,
    addEvent,
    updateEvent,
    removeEvent,
    setUserLocation,
    getNearbyServices,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    exportData,
    importData,
  };

  return <CivicServicesContext.Provider value={value}>{children}</CivicServicesContext.Provider>;
}

// Hook
export function useCivicServices() {
  const context = useContext(CivicServicesContext);
  if (context === undefined) {
    throw new Error('useCivicServices must be used within a CivicServicesProvider');
  }
  return context;
}
