import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const { getItem, setItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Default settings
    const defaultSettings = {
        // Appearance
        theme: 'system',
        fontSize: 'medium',
        compactMode: false,
        
        // Notifications
        pushNotifications: false,
        emailNotifications: false,
        soundNotifications: false,
        dailySummary: false,
        
        // Privacy
        dataCollection: false,
        analytics: false,
        autoLogout: true,
        
        // General
        autoSave: true,
        startupPage: 'home',
        sessionTimeout: 30,
        
        // Language
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        
        // Data
        autoBackup: true,
        backupFrequency: 'daily',
        
        // AI
        aiPersonality: 'balanced',
        aiResponseLength: 'medium',
        aiCreativity: 'medium',
        
        // Performance
        enableCaching: true,
        enableCompression: true,
        maxMemoryUsage: 2048
    };

    // Initialize settings
    useEffect(() => {
        const initializeSettings = () => {
            const savedSettings = getItem('app_settings');
            if (savedSettings) {
                try {
                    const parsedSettings = JSON.parse(savedSettings);
                    setSettings({ ...defaultSettings, ...parsedSettings });
                } catch (error) {
                    console.error('Failed to parse saved settings:', error);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
            setIsLoaded(true);
        };

        initializeSettings();
    }, []);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (isLoaded) {
            setItem('app_settings', JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    const updateSettings = useCallback((updates) => {
        setSettings(prev => {
            const newSettings = { ...prev, ...updates };
            
            // Track setting changes
            Object.keys(updates).forEach(key => {
                trackEvent('setting_changed', {
                    key,
                    oldValue: prev[key],
                    newValue: updates[key]
                });
            });
            
            return newSettings;
        });
    }, [trackEvent]);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        trackEvent('settings_reset');
    }, [trackEvent]);

    const getSetting = useCallback((key) => {
        return settings[key];
    }, [settings]);

    const setSetting = useCallback((key, value) => {
        updateSettings({ [key]: value });
    }, [updateSettings]);

    const exportSettings = useCallback(() => {
        const exportData = {
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `careconnect_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackEvent('settings_exported');
    }, [settings, trackEvent]);

    const importSettings = useCallback(async (file) => {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.settings) {
                setSettings(importData.settings);
                trackEvent('settings_imported', {
                    importDate: importData.exportDate,
                    settingsCount: Object.keys(importData.settings).length
                });
                return { success: true };
            } else {
                throw new Error('Invalid settings file format');
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
            trackEvent('settings_import_error', { error: error.message });
            return { success: false, error: error.message };
        }
    }, [trackEvent]);

    const getSettingsByCategory = useCallback(() => {
        return {
            appearance: {
                theme: settings.theme,
                fontSize: settings.fontSize,
                compactMode: settings.compactMode
            },
            notifications: {
                pushNotifications: settings.pushNotifications,
                emailNotifications: settings.emailNotifications,
                soundNotifications: settings.soundNotifications,
                dailySummary: settings.dailySummary
            },
            privacy: {
                dataCollection: settings.dataCollection,
                analytics: settings.analytics,
                autoLogout: settings.autoLogout
            },
            general: {
                autoSave: settings.autoSave,
                startupPage: settings.startupPage,
                sessionTimeout: settings.sessionTimeout
            },
            language: {
                language: settings.language,
                dateFormat: settings.dateFormat,
                timeFormat: settings.timeFormat
            },
            data: {
                autoBackup: settings.autoBackup,
                backupFrequency: settings.backupFrequency
            },
            ai: {
                aiPersonality: settings.aiPersonality,
                aiResponseLength: settings.aiResponseLength,
                aiCreativity: settings.aiCreativity
            },
            performance: {
                enableCaching: settings.enableCaching,
                enableCompression: settings.enableCompression,
                maxMemoryUsage: settings.maxMemoryUsage
            }
        };
    }, [settings]);

    const validateSettings = useCallback(() => {
        const errors = [];
        
        // Validate session timeout
        if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
            errors.push('Session timeout must be between 5 and 480 minutes');
        }
        
        // Validate memory usage
        if (settings.maxMemoryUsage < 512 || settings.maxMemoryUsage > 8192) {
            errors.push('Max memory usage must be between 512 and 8192 MB');
        }
        
        return errors;
    }, [settings]);

    const value = {
        settings,
        isLoaded,
        updateSettings,
        resetSettings,
        getSetting,
        setSetting,
        exportSettings,
        importSettings,
        getSettingsByCategory,
        validateSettings,
        defaultSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
