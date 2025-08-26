import { useState, useContext, createContext } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loadingStates, setLoadingStates] = useState({});
    const [globalLoading, setGlobalLoading] = useState(false);

    const setLoading = (key, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: isLoading
        }));
    };

    const isLoading = (key) => {
        return loadingStates[key] || false;
    };

    const setGlobalLoadingState = (isLoading) => {
        setGlobalLoading(isLoading);
    };

    const getLoadingStates = () => {
        return loadingStates;
    };

    const clearLoadingStates = () => {
        setLoadingStates({});
        setGlobalLoading(false);
    };

    const value = {
        loadingStates,
        globalLoading,
        setLoading,
        isLoading,
        setGlobalLoadingState,
        getLoadingStates,
        clearLoadingStates
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
