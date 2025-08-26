import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const { getItem, setItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Initialize notifications from localStorage
    useEffect(() => {
        const savedNotifications = getItem('notifications');
        if (savedNotifications) {
            try {
                setNotifications(JSON.parse(savedNotifications));
            } catch (error) {
                console.error('Failed to parse saved notifications:', error);
            }
        }

        // Check notification permission
        checkNotificationPermission();
    }, []);

    // Save notifications to localStorage when they change
    useEffect(() => {
        setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const checkNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = Notification.permission;
            setIsPermissionGranted(permission === 'granted');
            
            if (permission === 'default') {
                trackEvent('notification_permission_prompt');
            }
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                setIsPermissionGranted(permission === 'granted');
                
                trackEvent('notification_permission_requested', { 
                    granted: permission === 'granted' 
                });
                
                return permission === 'granted';
            } catch (error) {
                console.error('Failed to request notification permission:', error);
                trackEvent('notification_permission_error', { error: error.message });
                return false;
            }
        }
        return false;
    };

    const addNotification = (notification) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newNotification = {
            id,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show browser notification if permission granted
        if (isPermissionGranted && notification.showBrowser !== false) {
            showBrowserNotification(newNotification);
        }

        trackEvent('notification_added', { 
            type: notification.type, 
            title: notification.title 
        });

        return id;
    };

    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.persistent || false,
                actions: notification.actions?.map(action => ({
                    action: action.key,
                    title: action.label
                })) || []
            });

            browserNotification.onclick = () => {
                window.focus();
                markAsRead(notification.id);
                
                if (notification.onClick) {
                    notification.onClick();
                }
            };

            browserNotification.onaction = (event) => {
                const action = notification.actions?.find(a => a.key === event.action);
                if (action?.onClick) {
                    action.onClick();
                }
            };

            // Auto-close after 5 seconds unless persistent
            if (!notification.persistent) {
                setTimeout(() => {
                    browserNotification.close();
                }, 5000);
            }
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        trackEvent('notification_removed', { id });
    };

    const clearNotification = (id) => {
        removeNotification(id);
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true }
                    : notification
            )
        );
        trackEvent('notification_marked_read', { id });
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        trackEvent('notifications_marked_all_read');
    };

    const clearAll = () => {
        setNotifications([]);
        trackEvent('notifications_cleared_all');
    };

    const clearRead = () => {
        setNotifications(prev => prev.filter(notification => !notification.read));
        trackEvent('notifications_cleared_read');
    };

    const getUnreadCount = () => {
        return notifications.filter(notification => !notification.read).length;
    };

    const getNotificationsByType = (type) => {
        return notifications.filter(notification => notification.type === type);
    };

    const getRecentNotifications = (count = 10) => {
        return notifications.slice(0, count);
    };

    // Predefined notification creators
    const showSuccess = (title, message, options = {}) => {
        return addNotification({
            type: 'success',
            title,
            message,
            duration: 5000,
            ...options
        });
    };

    const showError = (title, message, options = {}) => {
        return addNotification({
            type: 'error',
            title,
            message,
            duration: 8000,
            persistent: true,
            ...options
        });
    };

    const showWarning = (title, message, options = {}) => {
        return addNotification({
            type: 'warning',
            title,
            message,
            duration: 6000,
            ...options
        });
    };

    const showInfo = (title, message, options = {}) => {
        return addNotification({
            type: 'info',
            title,
            message,
            duration: 4000,
            ...options
        });
    };

    const showPersistent = (title, message, actions = [], options = {}) => {
        return addNotification({
            type: 'info',
            title,
            message,
            persistent: true,
            actions,
            ...options
        });
    };

    const value = {
        notifications,
        isPermissionGranted,
        addNotification,
        removeNotification,
        clearNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearRead,
        getUnreadCount,
        getNotificationsByType,
        getRecentNotifications,
        requestNotificationPermission,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showPersistent
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
