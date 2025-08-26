import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
    // Get from local storage then parse stored json or return initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Listen for changes to this localStorage key in other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(`Error parsing localStorage key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue];
};

// Utility functions for localStorage operations
export const useLocalStorageUtils = () => {
    const getItem = useCallback((key) => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return null;
        }
    }, []);

    const setItem = useCallback((key, value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
            return false;
        }
    }, []);

    const removeItem = useCallback((key) => {
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
            return false;
        }
    }, []);

    const clear = useCallback(() => {
        try {
            window.localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }, []);

    const hasItem = useCallback((key) => {
        try {
            return window.localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`Error checking localStorage key "${key}":`, error);
            return false;
        }
    }, []);

    const getKeys = useCallback(() => {
        try {
            return Object.keys(window.localStorage);
        } catch (error) {
            console.error('Error getting localStorage keys:', error);
            return [];
        }
    }, []);

    const getSize = useCallback(() => {
        try {
            let size = 0;
            for (let key in window.localStorage) {
                if (window.localStorage.hasOwnProperty(key)) {
                    size += window.localStorage[key].length;
                }
            }
            return size;
        } catch (error) {
            console.error('Error calculating localStorage size:', error);
            return 0;
        }
    }, []);

    const getQuota = useCallback(() => {
        try {
            // This is a rough estimation - browsers don't provide exact quota info
            const testKey = '__storage_test__';
            const testValue = 'x'.repeat(1024 * 1024); // 1MB
            let quota = 0;
            
            while (true) {
                try {
                    window.localStorage.setItem(testKey + quota, testValue);
                    quota += 1024 * 1024; // 1MB increments
                } catch (e) {
                    // Clean up test data
                    for (let i = 0; i < quota; i += 1024 * 1024) {
                        try {
                            window.localStorage.removeItem(testKey + i);
                        } catch (cleanupError) {
                            // Ignore cleanup errors
                        }
                    }
                    break;
                }
            }
            
            return quota;
        } catch (error) {
            console.error('Error calculating localStorage quota:', error);
            return 0;
        }
    }, []);

    const isAvailable = useCallback(() => {
        try {
            const test = '__localStorage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }, []);

    return {
        getItem,
        setItem,
        removeItem,
        clear,
        hasItem,
        getKeys,
        getSize,
        getQuota,
        isAvailable
    };
};
