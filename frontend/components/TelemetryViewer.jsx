import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Icons
import { 
    ChartIcon, 
    DownloadIcon, 
    RefreshIcon, 
    FilterIcon,
    CalendarIcon,
    ClockIcon,
    ActivityIcon,
    PerformanceIcon,
    ErrorIcon,
    UserIcon
} from '../assets/icons';

const TelemetryViewer = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('24h');
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [telemetryData, setTelemetryData] = useState(null);
    
    const { getTelemetryData, clearTelemetryData, exportTelemetryData } = useTelemetry();
    const { getItem } = useLocalStorage();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartIcon },
        { id: 'performance', label: 'Performance', icon: PerformanceIcon },
        { id: 'errors', label: 'Errors', icon: ErrorIcon },
        { id: 'user', label: 'User Activity', icon: UserIcon },
        { id: 'system', label: 'System', icon: ActivityIcon }
    ];

    const timeRanges = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: 'all', label: 'All Time' }
    ];

    const filters = [
        { value: 'all', label: 'All Events' },
        { value: 'errors', label: 'Errors Only' },
        { value: 'performance', label: 'Performance' },
        { value: 'user', label: 'User Actions' },
        { value: 'system', label: 'System Events' }
    ];

    useEffect(() => {
        if (isOpen) {
            loadTelemetryData();
        }
    }, [isOpen, timeRange, filter]);

    const loadTelemetryData = async () => {
        setIsLoading(true);
        try {
            const data = await getTelemetryData(timeRange, filter);
            setTelemetryData(data);
        } catch (error) {
            console.error('Failed to load telemetry data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleRefresh = () => {
        loadTelemetryData();
    };

    const handleExport = async () => {
        try {
            await exportTelemetryData(timeRange, filter);
        } catch (error) {
            console.error('Failed to export telemetry data:', error);
        }
    };

    const handleClear = async () => {
        if (window.confirm('Are you sure you want to clear all telemetry data? This action cannot be undone.')) {
            try {
                await clearTelemetryData();
                setTelemetryData(null);
            } catch (error) {
                console.error('Failed to clear telemetry data:', error);
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatDuration = (ms) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    const renderOverview = () => {
        if (!telemetryData) return <div className="no-data">No data available</div>;

        const { summary, recentEvents } = telemetryData;

        return (
            <div className="telemetry-overview">
                <div className="overview-stats">
                    <div className="stat-card">
                        <div className="stat-value">{summary.totalEvents}</div>
                        <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{summary.errorCount}</div>
                        <div className="stat-label">Errors</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{summary.avgResponseTime}ms</div>
                        <div className="stat-label">Avg Response Time</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{summary.activeUsers}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                </div>

                <div className="recent-events">
                    <h3>Recent Events</h3>
                    <div className="events-list">
                        {recentEvents.map((event, index) => (
                            <div key={index} className={`event-item ${event.type}`}>
                                <div className="event-time">{formatTimestamp(event.timestamp)}</div>
                                <div className="event-type">{event.type}</div>
                                <div className="event-message">{event.message}</div>
                                {event.duration && (
                                    <div className="event-duration">{formatDuration(event.duration)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPerformance = () => {
        if (!telemetryData?.performance) return <div className="no-data">No performance data available</div>;

        const { performance } = telemetryData;

        return (
            <div className="telemetry-performance">
                <div className="performance-metrics">
                    <div className="metric-group">
                        <h4>Response Times</h4>
                        <div className="metric-item">
                            <span>Average:</span>
                            <span>{performance.avgResponseTime}ms</span>
                        </div>
                        <div className="metric-item">
                            <span>Median:</span>
                            <span>{performance.medianResponseTime}ms</span>
                        </div>
                        <div className="metric-item">
                            <span>95th Percentile:</span>
                            <span>{performance.p95ResponseTime}ms</span>
                        </div>
                    </div>

                    <div className="metric-group">
                        <h4>Memory Usage</h4>
                        <div className="metric-item">
                            <span>Average:</span>
                            <span>{performance.avgMemoryUsage}MB</span>
                        </div>
                        <div className="metric-item">
                            <span>Peak:</span>
                            <span>{performance.peakMemoryUsage}MB</span>
                        </div>
                    </div>

                    <div className="metric-group">
                        <h4>CPU Usage</h4>
                        <div className="metric-item">
                            <span>Average:</span>
                            <span>{performance.avgCpuUsage}%</span>
                        </div>
                        <div className="metric-item">
                            <span>Peak:</span>
                            <span>{performance.peakCpuUsage}%</span>
                        </div>
                    </div>
                </div>

                <div className="performance-chart">
                    <h4>Response Time Trend</h4>
                    <div className="chart-placeholder">
                        Chart visualization would go here
                    </div>
                </div>
            </div>
        );
    };

    const renderErrors = () => {
        if (!telemetryData?.errors) return <div className="no-data">No error data available</div>;

        const { errors } = telemetryData;

        return (
            <div className="telemetry-errors">
                <div className="errors-summary">
                    <div className="error-stat">
                        <span className="error-count">{errors.totalErrors}</span>
                        <span className="error-label">Total Errors</span>
                    </div>
                    <div className="error-stat">
                        <span className="error-count">{errors.uniqueErrors}</span>
                        <span className="error-label">Unique Errors</span>
                    </div>
                    <div className="error-stat">
                        <span className="error-count">{errors.errorRate}%</span>
                        <span className="error-label">Error Rate</span>
                    </div>
                </div>

                <div className="errors-list">
                    <h4>Recent Errors</h4>
                    {errors.recentErrors.map((error, index) => (
                        <div key={index} className="error-item">
                            <div className="error-header">
                                <span className="error-time">{formatTimestamp(error.timestamp)}</span>
                                <span className="error-type">{error.type}</span>
                            </div>
                            <div className="error-message">{error.message}</div>
                            {error.stack && (
                                <details className="error-stack">
                                    <summary>Stack Trace</summary>
                                    <pre>{error.stack}</pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderUserActivity = () => {
        if (!telemetryData?.userActivity) return <div className="no-data">No user activity data available</div>;

        const { userActivity } = telemetryData;

        return (
            <div className="telemetry-user-activity">
                <div className="activity-summary">
                    <div className="activity-stat">
                        <span className="activity-value">{userActivity.totalSessions}</span>
                        <span className="activity-label">Total Sessions</span>
                    </div>
                    <div className="activity-stat">
                        <span className="activity-value">{userActivity.avgSessionDuration}</span>
                        <span className="activity-label">Avg Session Duration</span>
                    </div>
                    <div className="activity-stat">
                        <span className="activity-value">{userActivity.mostActivePage}</span>
                        <span className="activity-label">Most Active Page</span>
                    </div>
                </div>

                <div className="activity-events">
                    <h4>User Events</h4>
                    {userActivity.events.map((event, index) => (
                        <div key={index} className="activity-event">
                            <div className="event-time">{formatTimestamp(event.timestamp)}</div>
                            <div className="event-action">{event.action}</div>
                            <div className="event-details">{event.details}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSystem = () => {
        if (!telemetryData?.system) return <div className="no-data">No system data available</div>;

        const { system } = telemetryData;

        return (
            <div className="telemetry-system">
                <div className="system-info">
                    <h4>System Information</h4>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Platform:</span>
                            <span className="info-value">{system.platform}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Browser:</span>
                            <span className="info-value">{system.browser}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Version:</span>
                            <span className="info-value">{system.version}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Screen Resolution:</span>
                            <span className="info-value">{system.screenResolution}</span>
                        </div>
                    </div>
                </div>

                <div className="system-metrics">
                    <h4>System Metrics</h4>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <span>Memory Usage:</span>
                            <span>{system.memoryUsage}MB</span>
                        </div>
                        <div className="metric-item">
                            <span>CPU Usage:</span>
                            <span>{system.cpuUsage}%</span>
                        </div>
                        <div className="metric-item">
                            <span>Network Status:</span>
                            <span className={system.networkStatus}>{system.networkStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'performance':
                return renderPerformance();
            case 'errors':
                return renderErrors();
            case 'user':
                return renderUserActivity();
            case 'system':
                return renderSystem();
            default:
                return renderOverview();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="telemetry-viewer">
            <div className="telemetry-container">
                {/* Header */}
                <div className="telemetry-header">
                    <h2>Telemetry Viewer</h2>
                    <div className="telemetry-actions">
                        <button className="action-button" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshIcon />
                            Refresh
                        </button>
                        <button className="action-button" onClick={handleExport}>
                            <DownloadIcon />
                            Export
                        </button>
                        <button className="action-button danger" onClick={handleClear}>
                            Clear Data
                        </button>
                        <button className="telemetry-close" onClick={onClose}>
                            ×
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="telemetry-controls">
                    <div className="control-group">
                        <label>Time Range:</label>
                        <select value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value)}>
                            {timeRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Filter:</label>
                        <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
                            {filters.map(filter => (
                                <option key={filter.value} value={filter.value}>{filter.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabs */}
                <div className="telemetry-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`telemetry-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <Icon />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="telemetry-content">
                    {isLoading ? (
                        <div className="loading">Loading telemetry data...</div>
                    ) : (
                        renderTabContent()
                    )}
                </div>
            </div>
        </div>
    );
};

export default TelemetryViewer;
