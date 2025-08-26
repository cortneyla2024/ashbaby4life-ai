import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [lastActivity, setLastActivity] = useState(null);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    
    const { getItem, setItem, removeItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Initialize session
    useEffect(() => {
        const initializeSession = () => {
            const savedSession = getItem('session');
            if (savedSession) {
                try {
                    const parsedSession = JSON.parse(savedSession);
                    setSession(parsedSession);
                    setIsActive(true);
                    setSessionStartTime(new Date(parsedSession.startTime));
                    setLastActivity(new Date(parsedSession.lastActivity));
                } catch (error) {
                    console.error('Failed to parse saved session:', error);
                    startNewSession();
                }
            } else {
                startNewSession();
            }
        };

        initializeSession();
    }, []);

    // Update session duration
    useEffect(() => {
        if (sessionStartTime) {
            const interval = setInterval(() => {
                const now = new Date();
                const duration = now - sessionStartTime;
                setSessionDuration(duration);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [sessionStartTime]);

    // Auto-save session
    useEffect(() => {
        if (session) {
            setItem('session', JSON.stringify(session));
        }
    }, [session]);

    // Track user activity
    useEffect(() => {
        const updateActivity = () => {
            if (isActive) {
                const now = new Date();
                setLastActivity(now);
                setSession(prev => prev ? {
                    ...prev,
                    lastActivity: now.toISOString(),
                    activityCount: (prev.activityCount || 0) + 1
                } : null);
            }
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity);
            });
        };
    }, [isActive]);

    const startNewSession = () => {
        const now = new Date();
        const newSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: now.toISOString(),
            lastActivity: now.toISOString(),
            activityCount: 0,
            pageViews: [],
            interactions: [],
            preferences: {},
            metadata: {
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            }
        };

        setSession(newSession);
        setIsActive(true);
        setSessionStartTime(now);
        setLastActivity(now);
        setSessionDuration(0);

        trackEvent('session_started', { sessionId: newSession.id });
    };

    const endSession = () => {
        if (session) {
            const sessionData = {
                ...session,
                endTime: new Date().toISOString(),
                duration: sessionDuration,
                totalActivity: session.activityCount || 0
            };

            trackEvent('session_ended', {
                sessionId: session.id,
                duration: sessionDuration,
                activityCount: session.activityCount || 0
            });

            // Save session data for analytics
            const savedSessions = getItem('session_history') || [];
            savedSessions.push(sessionData);
            setItem('session_history', JSON.stringify(savedSessions.slice(-50))); // Keep last 50 sessions

            setSession(null);
            setIsActive(false);
            setSessionStartTime(null);
            setLastActivity(null);
            setSessionDuration(0);
            removeItem('session');
        }
    };

    const updateSessionData = (updates) => {
        if (session) {
            setSession(prev => ({
                ...prev,
                ...updates,
                lastActivity: new Date().toISOString()
            }));
        }
    };

    const addPageView = (pageData) => {
        if (session) {
            const pageView = {
                url: pageData.url || window.location.href,
                title: pageData.title || document.title,
                timestamp: new Date().toISOString(),
                referrer: pageData.referrer || document.referrer,
                timeSpent: pageData.timeSpent || 0
            };

            setSession(prev => ({
                ...prev,
                pageViews: [...(prev.pageViews || []), pageView],
                lastActivity: new Date().toISOString()
            }));

            trackEvent('page_viewed', pageView);
        }
    };

    const addInteraction = (interactionData) => {
        if (session) {
            const interaction = {
                type: interactionData.type,
                target: interactionData.target,
                timestamp: new Date().toISOString(),
                data: interactionData.data || {},
                page: window.location.href
            };

            setSession(prev => ({
                ...prev,
                interactions: [...(prev.interactions || []), interaction],
                lastActivity: new Date().toISOString()
            }));

            trackEvent('interaction_logged', interaction);
        }
    };

    const updatePreferences = (preferences) => {
        if (session) {
            setSession(prev => ({
                ...prev,
                preferences: {
                    ...(prev.preferences || {}),
                    ...preferences
                },
                lastActivity: new Date().toISOString()
            }));
        }
    };

    const getSessionStats = () => {
        if (!session) return null;

        return {
            duration: sessionDuration,
            activityCount: session.activityCount || 0,
            pageViews: session.pageViews?.length || 0,
            interactions: session.interactions?.length || 0,
            isActive,
            lastActivity,
            startTime: session.startTime
        };
    };

    const getSessionHistory = () => {
        const savedSessions = getItem('session_history') || [];
        return savedSessions;
    };

    const clearSessionHistory = () => {
        removeItem('session_history');
    };

    const exportSessionData = () => {
        if (!session) return null;

        const exportData = {
            currentSession: session,
            sessionHistory: getSessionHistory(),
            stats: getSessionStats()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackEvent('session_data_exported');
    };

    const value = {
        session,
        isActive,
        lastActivity,
        sessionDuration,
        startNewSession,
        endSession,
        updateSessionData,
        addPageView,
        addInteraction,
        updatePreferences,
        getSessionStats,
        getSessionHistory,
        clearSessionHistory,
        exportSessionData
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
