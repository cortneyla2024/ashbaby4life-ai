import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');
    const { getItem, setItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Default to system preference
            setTheme('system');
        }
    }, []);

    // Resolve theme based on system preference
    useEffect(() => {
        const resolveTheme = () => {
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setResolvedTheme(systemTheme);
            } else {
                setResolvedTheme(theme);
            }
        };

        resolveTheme();

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                resolveTheme();
                trackEvent('theme_system_changed', { newTheme: resolvedTheme });
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolvedTheme);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff');
        }
    }, [resolvedTheme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setItem('theme', newTheme);
        trackEvent('theme_toggled', { newTheme });
    };

    const setThemeMode = (newTheme) => {
        setTheme(newTheme);
        setItem('theme', newTheme);
        trackEvent('theme_changed', { newTheme });
    };

    const getAvailableThemes = () => [
        { value: 'light', label: 'Light', icon: '☀️' },
        { value: 'dark', label: 'Dark', icon: '🌙' },
        { value: 'system', label: 'System', icon: '💻' }
    ];

    const value = {
        theme,
        resolvedTheme,
        toggleTheme,
        setTheme: setThemeMode,
        getAvailableThemes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
