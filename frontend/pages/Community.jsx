import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useAIResponse } from '../hooks/useAIResponse';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    CommunityIcon, 
    GroupIcon, 
    EventIcon, 
    MessageIcon, 
    ShareIcon,
    ConnectIcon,
    SupportIcon,
    VolunteerIcon,
    NetworkIcon,
    CollaborationIcon,
    DiscussionIcon,
    ResourceIcon,
    MentorIcon,
    LearnIcon
} from '../assets/icons';

const Community = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();
    const { getConnectorsByType, activateConnector } = useConnector();
    const { sendMessage, conversation, isLoading: aiLoading } = useAIResponse();
    
    const [communityData, setCommunityData] = useState({
        groups: [
            {
                id: 1,
                name: 'Local Wellness Group',
                type: 'health',
                members: 45,
                description: 'A community focused on health and wellness practices',
                lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
                isMember: true
            },
            {
                id: 2,
                name: 'Creative Artists Network',
                type: 'creativity',
                members: 128,
                description: 'Connect with fellow artists and share creative work',
                lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
                isMember: false
            },
            {
                id: 3,
                name: 'Financial Planning Community',
                type: 'finance',
                members: 89,
                description: 'Discuss financial strategies and share investment tips',
                lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                isMember: true
            }
        ],
        events: [
            {
                id: 1,
                title: 'Wellness Workshop',
                type: 'health',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
                location: 'Community Center',
                attendees: 25,
                maxAttendees: 50,
                description: 'Learn about mindfulness and stress management'
            },
            {
                id: 2,
                title: 'Art Exhibition',
                type: 'creativity',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
                location: 'Local Gallery',
                attendees: 45,
                maxAttendees: 100,
                description: 'Showcase local artists and their work'
            },
            {
                id: 3,
                title: 'Financial Literacy Seminar',
                type: 'finance',
                date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
                location: 'Library',
                attendees: 30,
                maxAttendees: 75,
                description: 'Learn about budgeting and investment basics'
            }
        ],
        connections: [
            {
                id: 1,
                name: 'Sarah Johnson',
                expertise: 'Health & Wellness',
                mutualInterests: ['meditation', 'yoga', 'nutrition'],
                lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
            },
            {
                id: 2,
                name: 'Michael Chen',
                expertise: 'Creative Arts',
                mutualInterests: ['digital art', 'photography', 'design'],
                lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
            },
            {
                id: 3,
                name: 'Emily Rodriguez',
                expertise: 'Financial Planning',
                mutualInterests: ['investing', 'budgeting', 'retirement'],
                lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
            }
        ]
    });
    const [communityConnectors, setCommunityConnectors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const initializeCommunity = async () => {
            setIsLoading(true);
            try {
                const connectors = getConnectorsByType('community');
                setCommunityConnectors(connectors);
                
                trackEvent('community_page_loaded', {
                    isAuthenticated,
                    connectorCount: connectors.length
                });
            } catch (error) {
                console.error('Failed to initialize community page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCommunity();
    }, [isAuthenticated, getConnectorsByType, trackEvent]);

    const handleCommunityRequest = async (request) => {
        try {
            await sendMessage(`Community request: ${request}`);
            trackEvent('community_request_made', { request });
        } catch (error) {
            console.error('Failed to send community request:', error);
        }
    };

    const communityCategories = [
        {
            id: 'health',
            name: 'Health & Wellness',
            icon: <GroupIcon />,
            description: 'Connect with health enthusiasts and wellness practitioners',
            color: 'green',
            memberCount: 156
        },
        {
            id: 'creativity',
            name: 'Creative Arts',
            icon: <ConnectIcon />,
            description: 'Join creative communities and share artistic work',
            color: 'purple',
            memberCount: 234
        },
        {
            id: 'finance',
            name: 'Financial Planning',
            icon: <NetworkIcon />,
            description: 'Connect with financial experts and planning enthusiasts',
            color: 'blue',
            memberCount: 189
        },
        {
            id: 'general',
            name: 'General Community',
            icon: <CommunityIcon />,
            description: 'General community discussions and connections',
            color: 'orange',
            memberCount: 445
        }
    ];

    const communityActions = [
        {
            title: 'Find Local Groups',
            description: 'Discover community groups in your area',
            icon: <GroupIcon />,
            action: () => handleCommunityRequest("Help me find local community groups")
        },
        {
            title: 'Start a Discussion',
            description: 'Begin a conversation with the community',
            icon: <DiscussionIcon />,
            action: () => handleCommunityRequest("Help me start a community discussion")
        },
        {
            title: 'Share Resources',
            description: 'Share helpful resources with the community',
            icon: <ShareIcon />,
            action: () => handleCommunityRequest("Help me share resources with the community")
        },
        {
            title: 'Find Mentors',
            description: 'Connect with experienced community members',
            icon: <MentorIcon />,
            action: () => handleCommunityRequest("Help me find mentors in the community")
        }
    ];

    const quickCommunityQuestions = [
        "How can I get more involved in my community?",
        "What are good ways to meet new people locally?",
        "How can I contribute to my community?",
        "What community events are happening nearby?",
        "How can I start a community group?",
        "What are the benefits of community involvement?"
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading your community connections..." />;
    }

    return (
        <div className="community-page">
            {/* Header */}
            <section className="community-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <CommunityIcon /> Community Connections
                    </h1>
                    <p className="page-subtitle">
                        Connect with like-minded individuals, join groups, and participate in community events
                    </p>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleCommunityRequest("Help me connect with my community")}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <LoadingSpinner size="small" /> : 'Connect with Community'}
                    </button>
                </div>
            </section>

            {/* Community Categories */}
            <section className="community-categories-section">
                <h2 className="section-title">Community Categories</h2>
                <div className="categories-grid">
                    {communityCategories.map((category) => (
                        <div 
                            key={category.id} 
                            className={`category-card ${category.color} ${selectedCategory === category.id || selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                        >
                            <div className="category-icon">
                                {category.icon}
                            </div>
                            <div className="category-content">
                                <h3 className="category-title">{category.name}</h3>
                                <p className="category-description">{category.description}</p>
                                <div className="category-stats">
                                    <span className="member-count">{category.memberCount} members</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Community Groups */}
            <section className="community-groups-section">
                <h2 className="section-title">Community Groups</h2>
                <div className="groups-grid">
                    {communityData.groups
                        .filter(group => selectedCategory === 'all' || group.type === selectedCategory)
                        .map((group) => (
                            <div key={group.id} className={`group-card ${group.isMember ? 'member' : ''}`}>
                                <div className="group-header">
                                    <div className="group-icon">
                                        <GroupIcon />
                                    </div>
                                    <div className="group-status">
                                        <span className={`status-badge ${group.isMember ? 'member' : 'non-member'}`}>
                                            {group.isMember ? 'Member' : 'Join'}
                                        </span>
                                    </div>
                                </div>
                                <div className="group-content">
                                    <h3 className="group-name">{group.name}</h3>
                                    <p className="group-description">{group.description}</p>
                                    <div className="group-stats">
                                        <span className="member-count">{group.members} members</span>
                                        <time className="last-activity">
                                            Last activity: {new Date(group.lastActivity).toLocaleDateString()}
                                        </time>
                                    </div>
                                </div>
                                <div className="group-actions">
                                    <button 
                                        className={`btn ${group.isMember ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={() => handleCommunityRequest(`Tell me more about the ${group.name} group`)}
                                    >
                                        {group.isMember ? 'View Group' : 'Learn More'}
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* Community Events */}
            <section className="community-events-section">
                <h2 className="section-title">Upcoming Events</h2>
                <div className="events-grid">
                    {communityData.events
                        .filter(event => selectedCategory === 'all' || event.type === selectedCategory)
                        .map((event) => (
                            <div key={event.id} className="event-card">
                                <div className="event-header">
                                    <div className="event-icon">
                                        <EventIcon />
                                    </div>
                                    <div className="event-date">
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="event-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-details">
                                        <div className="event-location">
                                            <span className="location-icon">📍</span>
                                            {event.location}
                                        </div>
                                        <div className="event-attendance">
                                            <span className="attendance-count">
                                                {event.attendees}/{event.maxAttendees} attending
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="event-actions">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => handleCommunityRequest(`Tell me more about the ${event.title} event`)}
                                    >
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* Community Connections */}
            <section className="community-connections-section">
                <h2 className="section-title">Your Connections</h2>
                <div className="connections-grid">
                    {communityData.connections.map((connection) => (
                        <div key={connection.id} className="connection-card">
                            <div className="connection-avatar">
                                <div className="avatar-placeholder">
                                    {connection.name.charAt(0)}
                                </div>
                            </div>
                            <div className="connection-content">
                                <h3 className="connection-name">{connection.name}</h3>
                                <p className="connection-expertise">{connection.expertise}</p>
                                <div className="connection-interests">
                                    <h4>Shared Interests:</h4>
                                    <div className="interest-tags">
                                        {connection.mutualInterests.map((interest, index) => (
                                            <span key={index} className="interest-tag">{interest}</span>
                                        ))}
                                    </div>
                                </div>
                                <time className="last-contact">
                                    Last contact: {new Date(connection.lastContact).toLocaleDateString()}
                                </time>
                            </div>
                            <div className="connection-actions">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => handleCommunityRequest(`Help me reconnect with ${connection.name}`)}
                                >
                                    Reconnect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Community Actions */}
            <section className="community-actions-section">
                <h2 className="section-title">Community Actions</h2>
                <div className="actions-grid">
                    {communityActions.map((action, index) => (
                        <div key={index} className="action-card">
                            <div className="action-icon">
                                {action.icon}
                            </div>
                            <div className="action-content">
                                <h3 className="action-title">{action.title}</h3>
                                <p className="action-description">{action.description}</p>
                            </div>
                            <button 
                                className="action-button"
                                onClick={action.action}
                                disabled={aiLoading}
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Community Questions */}
            <section className="quick-questions-section">
                <h2 className="section-title">Quick Community Questions</h2>
                <div className="questions-grid">
                    {quickCommunityQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="question-card"
                            onClick={() => handleCommunityRequest(question)}
                            disabled={aiLoading}
                        >
                            <div className="question-content">
                                <p className="question-text">{question}</p>
                                <div className="question-icon">
                                    <CommunityIcon />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Community Connectors */}
            {communityConnectors.length > 0 && (
                <section className="community-connectors-section">
                    <h2 className="section-title">Community Services</h2>
                    <div className="connectors-grid">
                        {communityConnectors.map((connector) => (
                            <DashboardCard
                                key={connector.id}
                                title={connector.name}
                                description={connector.description}
                                icon={connector.icon}
                                status={connector.status}
                                lastUsed={connector.lastUsed}
                                usageCount={connector.usageCount}
                                actions={[
                                    {
                                        label: connector.status === 'active' ? 'Deactivate' : 'Activate',
                                        action: () => activateConnector(connector.id),
                                        variant: connector.status === 'active' ? 'secondary' : 'primary'
                                    }
                                ]}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* AI Community Assistant */}
            <section className="ai-community-assistant-section">
                <h2 className="section-title">AI Community Assistant</h2>
                <div className="ai-assistant-content">
                    <div className="assistant-info">
                        <h3>Your Community Guide</h3>
                        <p>
                            Get help finding community groups, planning events, connecting with others, 
                            and building meaningful relationships in your local area.
                        </p>
                    </div>
                    
                    {conversation.length > 0 && (
                        <div className="recent-community-conversation">
                            <h4>Recent Community Discussion</h4>
                            <div className="conversation-preview">
                                {conversation
                                    .filter(msg => msg.content.toLowerCase().includes('community') || 
                                                   msg.content.toLowerCase().includes('group') ||
                                                   msg.content.toLowerCase().includes('connect'))
                                    .slice(-2)
                                    .map((message, index) => (
                                        <div key={index} className={`conversation-message ${message.role}`}>
                                            <div className="message-content">
                                                <p>{message.content}</p>
                                            </div>
                                            <time className="message-time">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </time>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Community Tips */}
            <section className="community-tips-section">
                <h2 className="section-title">Community Building Tips</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">
                            <ConnectIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Be Authentic</h3>
                            <p>Show your true self and be genuine in your interactions with community members.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <SupportIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Offer Support</h3>
                            <p>Look for ways to help others in your community and offer your skills and knowledge.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <CollaborationIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Collaborate</h3>
                            <p>Work together with community members on projects and initiatives that benefit everyone.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Community;
