import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';

const TelemetryContext = createContext();

export const TelemetryProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [isEnabled, setIsEnabled] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    const { getItem, setItem } = useLocalStorage();

    // Initialize telemetry
    useEffect(() => {
        const initializeTelemetry = () => {
            // Check if telemetry is enabled
            const telemetryEnabled = getItem('telemetry_enabled');
            if (telemetryEnabled !== null) {
                setIsEnabled(telemetryEnabled === 'true');
            }

            // Generate session ID
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);

            // Load existing events
            const savedEvents = getItem('telemetry_events');
            if (savedEvents) {
                try {
                    setEvents(JSON.parse(savedEvents));
                } catch (error) {
                    console.error('Failed to parse saved telemetry events:', error);
                }
            }

            // Track session start
            trackEvent('session_started', {
                sessionId: newSessionId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
        };

        initializeTelemetry();
    }, []);

    // Save events to localStorage when they change
    useEffect(() => {
        if (events.length > 0) {
            setItem('telemetry_events', JSON.stringify(events));
        }
    }, [events]);

    const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const trackEvent = (eventName, data = {}) => {
        if (!isEnabled) return;

        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: eventName,
            data,
            timestamp: new Date().toISOString(),
            sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        setEvents(prev => [...prev, event]);

        // Keep only last 1000 events to prevent memory issues
        if (events.length >= 1000) {
            setEvents(prev => prev.slice(-999));
        }

        // Send to backend if available
        sendToBackend(event);
    };

    const sendToBackend = async (event) => {
        try {
            await fetch('/api/telemetry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            // Silently fail - telemetry should not break the app
            console.debug('Failed to send telemetry event:', error);
        }
    };

    const getTelemetryData = async (timeRange = '24h', filter = 'all') => {
        try {
            const response = await fetch(`/api/telemetry?timeRange=${timeRange}&filter=${filter}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch telemetry data');
        } catch (error) {
            console.error('Failed to get telemetry data:', error);
            return null;
        }
    };

    const clearTelemetryData = async () => {
        try {
            const response = await fetch('/api/telemetry', {
                method: 'DELETE'
            });
            if (response.ok) {
                setEvents([]);
                return true;
            }
            throw new Error('Failed to clear telemetry data');
        } catch (error) {
            console.error('Failed to clear telemetry data:', error);
            return false;
        }
    };

    const exportTelemetryData = async (timeRange = 'all', filter = 'all') => {
        try {
            const response = await fetch(`/api/telemetry/export?timeRange=${timeRange}&filter=${filter}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `telemetry_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return true;
            }
            throw new Error('Failed to export telemetry data');
        } catch (error) {
            console.error('Failed to export telemetry data:', error);
            return false;
        }
    };

    const toggleTelemetry = () => {
        const newEnabled = !isEnabled;
        setIsEnabled(newEnabled);
        setItem('telemetry_enabled', newEnabled.toString());
        
        if (newEnabled) {
            trackEvent('telemetry_enabled');
        } else {
            trackEvent('telemetry_disabled');
        }
    };

    const getEventsByType = (eventName) => {
        return events.filter(event => event.name === eventName);
    };

    const getEventsByTimeRange = (startTime, endTime) => {
        return events.filter(event => {
            const eventTime = new Date(event.timestamp);
            return eventTime >= startTime && eventTime <= endTime;
        });
    };

    const getEventCount = (eventName) => {
        return events.filter(event => event.name === eventName).length;
    };

    const getSessionEvents = () => {
        return events.filter(event => event.sessionId === sessionId);
    };

    const getAnalytics = () => {
        const analytics = {
            totalEvents: events.length,
            sessionEvents: getSessionEvents().length,
            uniqueEventTypes: [...new Set(events.map(e => e.name))].length,
            eventTypes: {},
            recentEvents: events.slice(-10),
            sessionDuration: calculateSessionDuration()
        };

        // Count events by type
        events.forEach(event => {
            analytics.eventTypes[event.name] = (analytics.eventTypes[event.name] || 0) + 1;
        });

        return analytics;
    };

    const calculateSessionDuration = () => {
        const sessionEvents = getSessionEvents();
        if (sessionEvents.length < 2) return 0;

        const firstEvent = new Date(sessionEvents[0].timestamp);
        const lastEvent = new Date(sessionEvents[sessionEvents.length - 1].timestamp);
        return lastEvent - firstEvent;
    };

    const value = {
        trackEvent,
        getTelemetryData,
        clearTelemetryData,
        exportTelemetryData,
        toggleTelemetry,
        isEnabled,
        events,
        sessionId,
        getEventsByType,
        getEventsByTimeRange,
        getEventCount,
        getSessionEvents,
        getAnalytics
    };

    return (
        <TelemetryContext.Provider value={value}>
            {children}
        </TelemetryContext.Provider>
    );
};

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (!context) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
};
