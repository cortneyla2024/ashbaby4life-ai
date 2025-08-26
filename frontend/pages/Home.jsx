import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useAIResponse } from '../hooks/useAIResponse';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    HomeIcon, 
    HealthIcon, 
    CreativityIcon, 
    FinanceIcon, 
    CommunityIcon,
    SettingsIcon,
    ChartIcon,
    ActivityIcon,
    MessageIcon,
    StarIcon
} from '../assets/icons';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();
    const { getConnectorStats, getActiveConnectors } = useConnector();
    const { sendMessage, conversation, isLoading: aiLoading } = useAIResponse();
    
    const [stats, setStats] = useState(null);
    const [activeConnectors, setActiveConnectors] = useState([]);
    const [quickMessage, setQuickMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeHome = async () => {
            setIsLoading(true);
            try {
                const connectorStats = getConnectorStats();
                const active = getActiveConnectors();
                
                setStats(connectorStats);
                setActiveConnectors(active);
                
                trackEvent('home_page_loaded', {
                    isAuthenticated,
                    connectorCount: connectorStats.total,
                    activeConnectorCount: connectorStats.active
                });
            } catch (error) {
                console.error('Failed to initialize home page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeHome();
    }, [isAuthenticated, getConnectorStats, getActiveConnectors, trackEvent]);

    const handleQuickMessage = async (e) => {
        e.preventDefault();
        if (!quickMessage.trim()) return;

        try {
            await sendMessage(quickMessage);
            setQuickMessage('');
            trackEvent('quick_message_sent', { messageLength: quickMessage.length });
        } catch (error) {
            console.error('Failed to send quick message:', error);
        }
    };

    const quickActions = [
        {
            title: 'Health Check',
            description: 'Get a quick health assessment',
            icon: <HealthIcon />,
            link: '/health',
            color: 'green'
        },
        {
            title: 'Creative Spark',
            description: 'Generate creative ideas',
            icon: <CreativityIcon />,
            link: '/creativity',
            color: 'purple'
        },
        {
            title: 'Financial Review',
            description: 'Review your financial status',
            icon: <FinanceIcon />,
            link: '/finance',
            color: 'blue'
        },
        {
            title: 'Community Connect',
            description: 'Connect with your community',
            icon: <CommunityIcon />,
            link: '/community',
            color: 'orange'
        }
    ];

    const recentActivity = [
        {
            type: 'connector_activated',
            title: 'Health Connector Activated',
            description: 'Your health monitoring is now active',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            icon: <HealthIcon />
        },
        {
            type: 'ai_response',
            title: 'AI Response Generated',
            description: 'Received personalized health recommendations',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            icon: <MessageIcon />
        },
        {
            type: 'settings_updated',
            title: 'Privacy Settings Updated',
            description: 'Enhanced your data protection settings',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            icon: <SettingsIcon />
        }
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading your dashboard..." />;
    }

    return (
        <div className="home-page">
            {/* Welcome Section */}
            <section className="welcome-section">
                <div className="welcome-content">
                    <h1 className="welcome-title">
                        Welcome back{isAuthenticated && user ? `, ${user.name}` : ''}!
                    </h1>
                    <p className="welcome-subtitle">
                        Your CareConnect steward is ready to assist you with health, creativity, 
                        finance, and community connections.
                    </p>
                    
                    {/* Quick AI Message */}
                    <form onSubmit={handleQuickMessage} className="quick-message-form">
                        <div className="input-group">
                            <input
                                type="text"
                                value={quickMessage}
                                onChange={(e) => setQuickMessage(e.target.value)}
                                placeholder="Ask your AI steward anything..."
                                className="quick-message-input"
                                disabled={aiLoading}
                            />
                            <button 
                                type="submit" 
                                className="quick-message-button"
                                disabled={aiLoading || !quickMessage.trim()}
                            >
                                {aiLoading ? <LoadingSpinner size="small" /> : <MessageIcon />}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="welcome-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <ChartIcon />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats?.total || 0}</div>
                            <div className="stat-label">Total Connectors</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <ActivityIcon />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats?.active || 0}</div>
                            <div className="stat-label">Active Services</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <StarIcon />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{conversation.length}</div>
                            <div className="stat-label">AI Interactions</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.link} className="quick-action-card">
                            <div className={`action-icon ${action.color}`}>
                                {action.icon}
                            </div>
                            <div className="action-content">
                                <h3 className="action-title">{action.title}</h3>
                                <p className="action-description">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Active Connectors */}
            {activeConnectors.length > 0 && (
                <section className="active-connectors-section">
                    <h2 className="section-title">Active Services</h2>
                    <div className="connectors-grid">
                        {activeConnectors.map((connector) => (
                            <DashboardCard
                                key={connector.id}
                                title={connector.name}
                                description={connector.description}
                                icon={connector.icon}
                                status="active"
                                lastUsed={connector.lastUsed}
                                usageCount={connector.usageCount}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Activity */}
            <section className="recent-activity-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">
                                {activity.icon}
                            </div>
                            <div className="activity-content">
                                <h4 className="activity-title">{activity.title}</h4>
                                <p className="activity-description">{activity.description}</p>
                                <time className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </time>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Conversation Preview */}
            {conversation.length > 0 && (
                <section className="ai-conversation-section">
                    <h2 className="section-title">Recent AI Conversation</h2>
                    <div className="conversation-preview">
                        {conversation.slice(-3).map((message, index) => (
                            <div 
                                key={index} 
                                className={`conversation-message ${message.role}`}
                            >
                                <div className="message-content">
                                    <p>{message.content}</p>
                                </div>
                                <time className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </time>
                            </div>
                        ))}
                    </div>
                    <Link to="/chat" className="view-all-conversations">
                        View All Conversations
                    </Link>
                </section>
            )}
        </div>
    );
};

export default Home;
