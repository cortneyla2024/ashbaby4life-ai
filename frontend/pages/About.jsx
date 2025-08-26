import React from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { 
    AboutIcon, 
    HeartIcon, 
    ShieldIcon, 
    BrainIcon, 
    UsersIcon,
    CodeIcon,
    StarIcon,
    AwardIcon
} from '../assets/icons';

const About = () => {
    const { trackEvent } = useTelemetry();

    React.useEffect(() => {
        trackEvent('about_page_loaded');
    }, [trackEvent]);

    const features = [
        {
            icon: <BrainIcon />,
            title: 'AI-Powered Intelligence',
            description: 'Advanced local AI engine providing personalized assistance and insights'
        },
        {
            icon: <ShieldIcon />,
            title: 'Privacy-First Design',
            description: 'Your data stays local with no external dependencies or cloud services'
        },
        {
            icon: <HeartIcon />,
            title: 'Holistic Wellness',
            description: 'Comprehensive support for health, creativity, finance, and community'
        },
        {
            icon: <UsersIcon />,
            title: 'Community Connection',
            description: 'Build meaningful relationships and connect with like-minded individuals'
        },
        {
            icon: <CodeIcon />,
            title: 'Self-Evolving Platform',
            description: 'Continuously improves and adapts to your needs autonomously'
        },
        {
            icon: <StarIcon />,
            title: 'Free-First Approach',
            description: 'No paid dependencies or subscriptions required'
        }
    ];

    const team = [
        {
            name: 'CareConnect AI',
            role: 'Lead Developer & AI Engineer',
            description: 'Autonomous AI system responsible for platform development and evolution'
        },
        {
            name: 'The Steward',
            role: 'AI Companion & Assistant',
            description: 'Your personal AI steward helping with daily tasks and decision-making'
        },
        {
            name: 'Community Contributors',
            role: 'Open Source Contributors',
            description: 'Dedicated individuals working to improve the platform for everyone'
        }
    ];

    const values = [
        {
            icon: <HeartIcon />,
            title: 'Empathy',
            description: 'We prioritize understanding and supporting your unique needs'
        },
        {
            icon: <ShieldIcon />,
            title: 'Privacy',
            description: 'Your data and conversations remain completely private and local'
        },
        {
            icon: <UsersIcon />,
            title: 'Community',
            description: 'Building connections and fostering meaningful relationships'
        },
        {
            icon: <StarIcon />,
            title: 'Excellence',
            description: 'Striving for the highest quality in everything we do'
        }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <AboutIcon /> About CareConnect v5.0
                    </h1>
                    <p className="hero-subtitle">
                        The Steward - Your Autonomous AI Companion for Holistic Well-being
                    </p>
                    <p className="hero-description">
                        CareConnect v5.0 is a revolutionary platform that combines advanced AI technology 
                        with a deep understanding of human needs. Built with privacy, autonomy, and 
                        community at its core, it serves as your personal steward for health, creativity, 
                        finance, and meaningful connections.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <h2 className="section-title">Our Mission</h2>
                <div className="mission-content">
                    <p>
                        To provide a comprehensive, privacy-respecting platform that empowers individuals 
                        to live healthier, more creative, financially secure, and socially connected lives 
                        through intelligent AI assistance and community support.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Key Features</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <div className="feature-content">
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <h2 className="section-title">Our Values</h2>
                <div className="values-grid">
                    {values.map((value, index) => (
                        <div key={index} className="value-card">
                            <div className="value-icon">
                                {value.icon}
                            </div>
                            <div className="value-content">
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <h2 className="section-title">The Team</h2>
                <div className="team-grid">
                    {team.map((member, index) => (
                        <div key={index} className="team-card">
                            <div className="member-avatar">
                                <div className="avatar-placeholder">
                                    {member.name.charAt(0)}
                                </div>
                            </div>
                            <div className="member-content">
                                <h3 className="member-name">{member.name}</h3>
                                <p className="member-role">{member.role}</p>
                                <p className="member-description">{member.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technology Section */}
            <section className="technology-section">
                <h2 className="section-title">Technology</h2>
                <div className="tech-content">
                    <div className="tech-item">
                        <h3>Local AI Engine</h3>
                        <p>
                            Powered by advanced machine learning models running entirely on your device, 
                            ensuring complete privacy and offline functionality.
                        </p>
                    </div>
                    <div className="tech-item">
                        <h3>Self-Evolving Architecture</h3>
                        <p>
                            The platform continuously learns and adapts to your preferences, improving 
                            its capabilities over time while maintaining ethical boundaries.
                        </p>
                    </div>
                    <div className="tech-item">
                        <h3>Modular Design</h3>
                        <p>
                            Built with a modular architecture that allows for easy customization, 
                            extension, and integration with your existing tools and workflows.
                        </p>
                    </div>
                </div>
            </section>

            {/* Version Info */}
            <section className="version-section">
                <h2 className="section-title">Version Information</h2>
                <div className="version-info">
                    <div className="version-item">
                        <strong>Version:</strong> 5.0.0
                    </div>
                    <div className="version-item">
                        <strong>Codename:</strong> The Steward
                    </div>
                    <div className="version-item">
                        <strong>Release Date:</strong> 2024
                    </div>
                    <div className="version-item">
                        <strong>License:</strong> MIT
                    </div>
                    <div className="version-item">
                        <strong>Architecture:</strong> Offline-First, Self-Evolving
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <h2 className="section-title">Get in Touch</h2>
                <div className="contact-content">
                    <p>
                        Have questions, suggestions, or want to contribute to CareConnect? 
                        We'd love to hear from you!
                    </p>
                    <div className="contact-methods">
                        <div className="contact-method">
                            <h3>Community</h3>
                            <p>Join our community discussions and share your experiences</p>
                        </div>
                        <div className="contact-method">
                            <h3>Feedback</h3>
                            <p>Help us improve by sharing your feedback and suggestions</p>
                        </div>
                        <div className="contact-method">
                            <h3>Contributions</h3>
                            <p>Contribute to the development and evolution of the platform</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
