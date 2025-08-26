import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useConnector } from '../hooks/useConnector';
import { useAIResponse } from '../hooks/useAIResponse';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    CreativityIcon, 
    ArtIcon, 
    MusicIcon, 
    WritingIcon, 
    DesignIcon,
    PhotographyIcon,
    VideoIcon,
    PoetryIcon,
    BrainstormIcon,
    InspirationIcon,
    PaletteIcon,
    LightbulbIcon,
    SparkIcon,
    StarIcon
} from '../assets/icons';

const Creativity = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();
    const { getConnectorsByType, activateConnector } = useConnector();
    const { sendMessage, conversation, isLoading: aiLoading } = useAIResponse();
    
    const [creativityData, setCreativityData] = useState({
        projects: [
            {
                id: 1,
                title: 'Digital Art Collection',
                type: 'art',
                status: 'in-progress',
                progress: 65,
                lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            },
            {
                id: 2,
                title: 'Poetry Anthology',
                type: 'writing',
                status: 'completed',
                progress: 100,
                lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
            },
            {
                id: 3,
                title: 'Music Composition',
                type: 'music',
                status: 'planning',
                progress: 25,
                lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
            }
        ],
        inspirations: [
            'Nature\'s patterns and rhythms',
            'Urban architecture and city life',
            'Emotional experiences and memories',
            'Cultural traditions and heritage',
            'Scientific discoveries and technology'
        ]
    });
    const [creativityConnectors, setCreativityConnectors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const initializeCreativity = async () => {
            setIsLoading(true);
            try {
                const connectors = getConnectorsByType('creativity');
                setCreativityConnectors(connectors);
                
                trackEvent('creativity_page_loaded', {
                    isAuthenticated,
                    connectorCount: connectors.length
                });
            } catch (error) {
                console.error('Failed to initialize creativity page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCreativity();
    }, [isAuthenticated, getConnectorsByType, trackEvent]);

    const handleCreativityRequest = async (request) => {
        try {
            await sendMessage(`Creativity request: ${request}`);
            trackEvent('creativity_request_made', { request });
        } catch (error) {
            console.error('Failed to send creativity request:', error);
        }
    };

    const creativityCategories = [
        {
            id: 'art',
            name: 'Visual Art',
            icon: <ArtIcon />,
            description: 'Digital art, painting, drawing, sculpture',
            color: 'purple'
        },
        {
            id: 'music',
            name: 'Music',
            icon: <MusicIcon />,
            description: 'Composition, production, performance',
            color: 'blue'
        },
        {
            id: 'writing',
            name: 'Writing',
            icon: <WritingIcon />,
            description: 'Poetry, prose, storytelling',
            color: 'green'
        },
        {
            id: 'design',
            name: 'Design',
            icon: <DesignIcon />,
            description: 'Graphic design, UI/UX, branding',
            color: 'orange'
        },
        {
            id: 'photography',
            name: 'Photography',
            icon: <PhotographyIcon />,
            description: 'Photo composition, editing, storytelling',
            color: 'pink'
        },
        {
            id: 'video',
            name: 'Video',
            icon: <VideoIcon />,
            description: 'Filmmaking, animation, editing',
            color: 'red'
        }
    ];

    const creativePrompts = [
        {
            category: 'art',
            prompt: 'Create a surreal landscape combining natural and urban elements',
            icon: <ArtIcon />
        },
        {
            category: 'music',
            prompt: 'Compose a piece inspired by the sound of rain on different surfaces',
            icon: <MusicIcon />
        },
        {
            category: 'writing',
            prompt: 'Write a poem about finding beauty in everyday moments',
            icon: <WritingIcon />
        },
        {
            category: 'design',
            prompt: 'Design a logo that represents growth and transformation',
            icon: <DesignIcon />
        },
        {
            category: 'photography',
            prompt: 'Capture the interplay of light and shadow in urban spaces',
            icon: <PhotographyIcon />
        },
        {
            category: 'video',
            prompt: 'Create a short film about a day in the life of a city',
            icon: <VideoIcon />
        }
    ];

    const inspirationSources = [
        {
            title: 'Nature',
            description: 'Patterns, colors, and rhythms found in the natural world',
            icon: <SparkIcon />,
            examples: ['Fractal patterns', 'Seasonal changes', 'Animal behavior']
        },
        {
            title: 'Culture',
            description: 'Traditions, art forms, and expressions from different societies',
            icon: <StarIcon />,
            examples: ['Folk art', 'Traditional music', 'Cultural symbols']
        },
        {
            title: 'Technology',
            description: 'Innovation, digital tools, and futuristic concepts',
            icon: <LightbulbIcon />,
            examples: ['AI art', 'Digital tools', 'Virtual reality']
        },
        {
            title: 'Emotions',
            description: 'Personal experiences, feelings, and human connections',
            icon: <InspirationIcon />,
            examples: ['Love and relationships', 'Personal growth', 'Shared experiences']
        }
    ];

    const quickCreativityRequests = [
        "Give me a creative writing prompt",
        "Suggest a color palette for a project",
        "Help me brainstorm ideas for a new project",
        "Create a mood board concept",
        "Suggest creative exercises to overcome blocks",
        "Help me develop a creative routine"
    ];

    if (isLoading) {
        return <LoadingSpinner text="Loading your creative space..." />;
    }

    return (
        <div className="creativity-page">
            {/* Header */}
            <section className="creativity-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <CreativityIcon /> Creative Studio
                    </h1>
                    <p className="page-subtitle">
                        Explore your creative potential and find inspiration for your artistic journey
                    </p>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleCreativityRequest("Give me a creative boost and inspiration")}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <LoadingSpinner size="small" /> : 'Get Creative Boost'}
                    </button>
                </div>
            </section>

            {/* Creative Categories */}
            <section className="creative-categories-section">
                <h2 className="section-title">Creative Categories</h2>
                <div className="categories-grid">
                    {creativityCategories.map((category) => (
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
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Creative Projects */}
            <section className="creative-projects-section">
                <h2 className="section-title">Your Creative Projects</h2>
                <div className="projects-grid">
                    {creativityData.projects
                        .filter(project => selectedCategory === 'all' || project.type === selectedCategory)
                        .map((project) => (
                            <div key={project.id} className={`project-card ${project.status}`}>
                                <div className="project-header">
                                    <div className="project-icon">
                                        {creativityCategories.find(cat => cat.id === project.type)?.icon}
                                    </div>
                                    <div className="project-status">
                                        <span className={`status-badge ${project.status}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <div className="project-progress">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">{project.progress}%</span>
                                    </div>
                                    <time className="project-date">
                                        Last modified: {new Date(project.lastModified).toLocaleDateString()}
                                    </time>
                                </div>
                                <div className="project-actions">
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => handleCreativityRequest(`Continue working on ${project.title}`)}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* Creative Prompts */}
            <section className="creative-prompts-section">
                <h2 className="section-title">Creative Prompts</h2>
                <div className="prompts-grid">
                    {creativePrompts
                        .filter(prompt => selectedCategory === 'all' || prompt.category === selectedCategory)
                        .map((prompt, index) => (
                            <div key={index} className="prompt-card">
                                <div className="prompt-icon">
                                    {prompt.icon}
                                </div>
                                <div className="prompt-content">
                                    <p className="prompt-text">{prompt.prompt}</p>
                                </div>
                                <button 
                                    className="prompt-action"
                                    onClick={() => handleCreativityRequest(`Help me with this prompt: ${prompt.prompt}`)}
                                    disabled={aiLoading}
                                >
                                    Explore
                                </button>
                            </div>
                        ))}
                </div>
            </section>

            {/* Inspiration Sources */}
            <section className="inspiration-sources-section">
                <h2 className="section-title">Sources of Inspiration</h2>
                <div className="inspiration-grid">
                    {inspirationSources.map((source, index) => (
                        <div key={index} className="inspiration-card">
                            <div className="inspiration-icon">
                                {source.icon}
                            </div>
                            <div className="inspiration-content">
                                <h3 className="inspiration-title">{source.title}</h3>
                                <p className="inspiration-description">{source.description}</p>
                                <div className="inspiration-examples">
                                    <h4>Examples:</h4>
                                    <ul>
                                        {source.examples.map((example, idx) => (
                                            <li key={idx}>{example}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <button 
                                className="inspiration-action"
                                onClick={() => handleCreativityRequest(`Give me inspiration from ${source.title.toLowerCase()}`)}
                            >
                                Get Inspired
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Creativity Requests */}
            <section className="quick-requests-section">
                <h2 className="section-title">Quick Creative Help</h2>
                <div className="requests-grid">
                    {quickCreativityRequests.map((request, index) => (
                        <button
                            key={index}
                            className="request-card"
                            onClick={() => handleCreativityRequest(request)}
                            disabled={aiLoading}
                        >
                            <div className="request-content">
                                <p className="request-text">{request}</p>
                                <div className="request-icon">
                                    <CreativityIcon />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Creativity Connectors */}
            {creativityConnectors.length > 0 && (
                <section className="creativity-connectors-section">
                    <h2 className="section-title">Creative Tools & Services</h2>
                    <div className="connectors-grid">
                        {creativityConnectors.map((connector) => (
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

            {/* AI Creative Assistant */}
            <section className="ai-creative-assistant-section">
                <h2 className="section-title">AI Creative Assistant</h2>
                <div className="ai-assistant-content">
                    <div className="assistant-info">
                        <h3>Your Creative Partner</h3>
                        <p>
                            Get creative prompts, overcome creative blocks, and explore new artistic 
                            directions with AI-powered inspiration and guidance.
                        </p>
                    </div>
                    
                    {conversation.length > 0 && (
                        <div className="recent-creative-conversation">
                            <h4>Recent Creative Discussion</h4>
                            <div className="conversation-preview">
                                {conversation
                                    .filter(msg => msg.content.toLowerCase().includes('creative') || 
                                                   msg.content.toLowerCase().includes('art') ||
                                                   msg.content.toLowerCase().includes('inspiration'))
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

            {/* Creative Tips */}
            <section className="creative-tips-section">
                <h2 className="section-title">Creative Tips & Techniques</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">
                            <BrainstormIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Embrace Constraints</h3>
                            <p>Limitations can spark creativity. Use constraints as creative challenges rather than obstacles.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <PaletteIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Cross-Pollinate Ideas</h3>
                            <p>Combine concepts from different fields to create unique and innovative work.</p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <LightbulbIcon />
                        </div>
                        <div className="tip-content">
                            <h3>Capture Inspiration</h3>
                            <p>Keep a creative journal to capture ideas, observations, and inspiration when they strike.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Creativity;
