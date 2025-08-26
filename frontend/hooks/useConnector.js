import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const ConnectorContext = createContext();

export const ConnectorProvider = ({ children }) => {
    const [connectors, setConnectors] = useState({});
    const [activeConnectors, setActiveConnectors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const { getItem, setItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Available connector types
    const connectorTypes = {
        health: {
            name: 'Health Connector',
            description: 'Connects to health and wellness services',
            icon: 'health',
            category: 'wellness',
            configurable: true
        },
        creativity: {
            name: 'Creativity Connector',
            description: 'Connects to creative and artistic services',
            icon: 'creativity',
            category: 'arts',
            configurable: true
        },
        finance: {
            name: 'Finance Connector',
            description: 'Connects to financial planning services',
            icon: 'finance',
            category: 'business',
            configurable: true
        },
        community: {
            name: 'Community Connector',
            description: 'Connects to community and social services',
            icon: 'community',
            category: 'social',
            configurable: true
        },
        governance: {
            name: 'Governance Connector',
            description: 'Connects to governance and decision-making services',
            icon: 'governance',
            category: 'management',
            configurable: true
        }
    };

    // Initialize connectors
    useEffect(() => {
        const initializeConnectors = async () => {
            setIsLoading(true);
            try {
                const savedConnectors = getItem('connectors');
                const savedActive = getItem('active_connectors');
                
                if (savedConnectors) {
                    setConnectors(JSON.parse(savedConnectors));
                }
                
                if (savedActive) {
                    setActiveConnectors(JSON.parse(savedActive));
                }
                
                trackEvent('connectors_initialized', {
                    connectorCount: Object.keys(connectors).length,
                    activeCount: activeConnectors.length
                });
            } catch (error) {
                console.error('Failed to initialize connectors:', error);
                setError('Failed to load connectors');
            } finally {
                setIsLoading(false);
            }
        };

        initializeConnectors();
    }, []);

    // Save connectors to localStorage when they change
    useEffect(() => {
        if (Object.keys(connectors).length > 0) {
            setItem('connectors', JSON.stringify(connectors));
        }
    }, [connectors]);

    // Save active connectors to localStorage when they change
    useEffect(() => {
        if (activeConnectors.length > 0) {
            setItem('active_connectors', JSON.stringify(activeConnectors));
        }
    }, [activeConnectors]);

    const addConnector = useCallback(async (type, config = {}) => {
        if (!connectorTypes[type]) {
            throw new Error(`Unknown connector type: ${type}`);
        }

        const connector = {
            id: `${type}_${Date.now()}`,
            type,
            name: connectorTypes[type].name,
            description: connectorTypes[type].description,
            icon: connectorTypes[type].icon,
            category: connectorTypes[type].category,
            configurable: connectorTypes[type].configurable,
            config,
            status: 'inactive',
            createdAt: new Date().toISOString(),
            lastUsed: null,
            usageCount: 0
        };

        setConnectors(prev => ({
            ...prev,
            [connector.id]: connector
        }));

        trackEvent('connector_added', {
            type,
            id: connector.id
        });

        return connector;
    }, [trackEvent]);

    const removeConnector = useCallback((id) => {
        setConnectors(prev => {
            const newConnectors = { ...prev };
            delete newConnectors[id];
            return newConnectors;
        });

        setActiveConnectors(prev => 
            prev.filter(connectorId => connectorId !== id)
        );

        trackEvent('connector_removed', { id });
    }, [trackEvent]);

    const activateConnector = useCallback(async (id) => {
        const connector = connectors[id];
        if (!connector) {
            throw new Error(`Connector not found: ${id}`);
        }

        try {
            // Simulate connection test
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setConnectors(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    status: 'active',
                    lastUsed: new Date().toISOString()
                }
            }));

            setActiveConnectors(prev => 
                prev.includes(id) ? prev : [...prev, id]
            );

            trackEvent('connector_activated', {
                id,
                type: connector.type
            });

            return true;
        } catch (error) {
            console.error('Failed to activate connector:', error);
            trackEvent('connector_activation_failed', {
                id,
                error: error.message
            });
            throw error;
        }
    }, [connectors, trackEvent]);

    const deactivateConnector = useCallback((id) => {
        setConnectors(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: 'inactive'
            }
        }));

        setActiveConnectors(prev => 
            prev.filter(connectorId => connectorId !== id)
        );

        trackEvent('connector_deactivated', { id });
    }, [trackEvent]);

    const updateConnectorConfig = useCallback((id, config) => {
        setConnectors(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                config: { ...prev[id].config, ...config },
                lastModified: new Date().toISOString()
            }
        }));

        trackEvent('connector_config_updated', { id });
    }, [trackEvent]);

    const testConnector = useCallback(async (id) => {
        const connector = connectors[id];
        if (!connector) {
            throw new Error(`Connector not found: ${id}`);
        }

        try {
            // Simulate connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            trackEvent('connector_tested', {
                id,
                type: connector.type,
                success: true
            });

            return { success: true, latency: Math.random() * 1000 };
        } catch (error) {
            trackEvent('connector_tested', {
                id,
                type: connector.type,
                success: false,
                error: error.message
            });
            throw error;
        }
    }, [connectors, trackEvent]);

    const getConnector = useCallback((id) => {
        return connectors[id];
    }, [connectors]);

    const getConnectorsByType = useCallback((type) => {
        return Object.values(connectors).filter(connector => connector.type === type);
    }, [connectors]);

    const getConnectorsByCategory = useCallback((category) => {
        return Object.values(connectors).filter(connector => connector.category === category);
    }, [connectors]);

    const getActiveConnectors = useCallback(() => {
        return activeConnectors.map(id => connectors[id]).filter(Boolean);
    }, [activeConnectors, connectors]);

    const getConnectorStats = useCallback(() => {
        const stats = {
            total: Object.keys(connectors).length,
            active: activeConnectors.length,
            byType: {},
            byCategory: {},
            mostUsed: [],
            recentlyUsed: []
        };

        // Count by type and category
        Object.values(connectors).forEach(connector => {
            stats.byType[connector.type] = (stats.byType[connector.type] || 0) + 1;
            stats.byCategory[connector.category] = (stats.byCategory[connector.category] || 0) + 1;
        });

        // Get most used connectors
        stats.mostUsed = Object.values(connectors)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 5);

        // Get recently used connectors
        stats.recentlyUsed = Object.values(connectors)
            .filter(c => c.lastUsed)
            .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
            .slice(0, 5);

        return stats;
    }, [connectors, activeConnectors]);

    const exportConnectors = useCallback(() => {
        const exportData = {
            connectors,
            activeConnectors,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `careconnect_connectors_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackEvent('connectors_exported');
    }, [connectors, activeConnectors, trackEvent]);

    const importConnectors = useCallback(async (file) => {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.connectors) {
                setConnectors(importData.connectors);
                if (importData.activeConnectors) {
                    setActiveConnectors(importData.activeConnectors);
                }
                
                trackEvent('connectors_imported', {
                    importDate: importData.exportDate,
                    connectorCount: Object.keys(importData.connectors).length
                });
                
                return { success: true };
            } else {
                throw new Error('Invalid connectors file format');
            }
        } catch (error) {
            console.error('Failed to import connectors:', error);
            trackEvent('connectors_import_error', { error: error.message });
            return { success: false, error: error.message };
        }
    }, [trackEvent]);

    const value = {
        connectors,
        activeConnectors,
        isLoading,
        error,
        connectorTypes,
        addConnector,
        removeConnector,
        activateConnector,
        deactivateConnector,
        updateConnectorConfig,
        testConnector,
        getConnector,
        getConnectorsByType,
        getConnectorsByCategory,
        getActiveConnectors,
        getConnectorStats,
        exportConnectors,
        importConnectors
    };

    return (
        <ConnectorContext.Provider value={value}>
            {children}
        </ConnectorContext.Provider>
    );
};

export const useConnector = () => {
    const context = useContext(ConnectorContext);
    if (!context) {
        throw new Error('useConnector must be used within a ConnectorProvider');
    }
    return context;
};
