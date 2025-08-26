import React from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { 
    PrivacyIcon, 
    ShieldIcon, 
    LockIcon, 
    EyeIcon, 
    DataIcon,
    SecurityIcon,
    TrustIcon,
    ControlIcon
} from '../assets/icons';

const Privacy = () => {
    const { trackEvent } = useTelemetry();

    React.useEffect(() => {
        trackEvent('privacy_page_loaded');
    }, [trackEvent]);

    const privacyPrinciples = [
        {
            icon: <LockIcon />,
            title: 'Local-First Architecture',
            description: 'All data processing and AI interactions happen locally on your device, ensuring complete privacy and control.'
        },
        {
            icon: <ShieldIcon />,
            title: 'No External Dependencies',
            description: 'CareConnect operates entirely offline with no cloud services, APIs, or external data collection.'
        },
        {
            icon: <EyeIcon />,
            title: 'Transparent Operations',
            description: 'Complete visibility into how your data is used, with full control over what information is stored.'
        },
        {
            icon: <ControlIcon />,
            title: 'User Control',
            description: 'You have complete control over your data, including the ability to export, delete, or modify it at any time.'
        }
    ];

    const dataHandling = [
        {
            category: 'Personal Information',
            description: 'Profile data, preferences, and settings',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        },
        {
            category: 'Conversation History',
            description: 'AI chat interactions and responses',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        },
        {
            category: 'Health Data',
            description: 'Health metrics, goals, and recommendations',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        },
        {
            category: 'Financial Information',
            description: 'Financial goals, budgets, and planning data',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        },
        {
            category: 'Creative Work',
            description: 'Art projects, writing, and creative content',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        },
        {
            category: 'Community Data',
            description: 'Community connections and group memberships',
            storage: 'Local device only',
            retention: 'Until you delete it',
            sharing: 'Never shared'
        }
    ];

    const securityMeasures = [
        {
            title: 'Local Encryption',
            description: 'All sensitive data is encrypted using industry-standard algorithms before storage.'
        },
        {
            title: 'No Network Transmission',
            description: 'No data is transmitted over the internet, eliminating the risk of interception.'
        },
        {
            title: 'Secure Storage',
            description: 'Data is stored securely on your device with appropriate access controls.'
        },
        {
            title: 'Regular Security Audits',
            description: 'The platform undergoes regular security reviews to identify and address vulnerabilities.'
        }
    ];

    const userRights = [
        {
            title: 'Right to Access',
            description: 'You can view all data stored by CareConnect at any time.'
        },
        {
            title: 'Right to Export',
            description: 'Export your data in standard formats for backup or transfer.'
        },
        {
            title: 'Right to Delete',
            description: 'Permanently delete any or all of your data at any time.'
        },
        {
            title: 'Right to Control',
            description: 'Choose what data is collected and how it is used.'
        }
    ];

    return (
        <div className="privacy-page">
            {/* Hero Section */}
            <section className="privacy-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <PrivacyIcon /> Privacy Policy
                    </h1>
                    <p className="hero-subtitle">
                        Your Privacy is Our Priority
                    </p>
                    <p className="hero-description">
                        At CareConnect, we believe privacy is a fundamental human right. Our platform is 
                        designed from the ground up to protect your data and give you complete control 
                        over your information.
                    </p>
                </div>
            </section>

            {/* Privacy Principles */}
            <section className="privacy-principles-section">
                <h2 className="section-title">Our Privacy Principles</h2>
                <div className="principles-grid">
                    {privacyPrinciples.map((principle, index) => (
                        <div key={index} className="principle-card">
                            <div className="principle-icon">
                                {principle.icon}
                            </div>
                            <div className="principle-content">
                                <h3 className="principle-title">{principle.title}</h3>
                                <p className="principle-description">{principle.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Handling */}
            <section className="data-handling-section">
                <h2 className="section-title">How We Handle Your Data</h2>
                <div className="data-table">
                    <div className="table-header">
                        <div className="header-cell">Data Category</div>
                        <div className="header-cell">Description</div>
                        <div className="header-cell">Storage</div>
                        <div className="header-cell">Retention</div>
                        <div className="header-cell">Sharing</div>
                    </div>
                    {dataHandling.map((item, index) => (
                        <div key={index} className="table-row">
                            <div className="table-cell">
                                <strong>{item.category}</strong>
                            </div>
                            <div className="table-cell">{item.description}</div>
                            <div className="table-cell">{item.storage}</div>
                            <div className="table-cell">{item.retention}</div>
                            <div className="table-cell">{item.sharing}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security Measures */}
            <section className="security-section">
                <h2 className="section-title">Security Measures</h2>
                <div className="security-grid">
                    {securityMeasures.map((measure, index) => (
                        <div key={index} className="security-card">
                            <div className="security-icon">
                                <SecurityIcon />
                            </div>
                            <div className="security-content">
                                <h3 className="security-title">{measure.title}</h3>
                                <p className="security-description">{measure.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* User Rights */}
            <section className="user-rights-section">
                <h2 className="section-title">Your Rights</h2>
                <div className="rights-grid">
                    {userRights.map((right, index) => (
                        <div key={index} className="right-card">
                            <div className="right-icon">
                                <ControlIcon />
                            </div>
                            <div className="right-content">
                                <h3 className="right-title">{right.title}</h3>
                                <p className="right-description">{right.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* No Tracking */}
            <section className="no-tracking-section">
                <h2 className="section-title">No Tracking, No Ads, No Third Parties</h2>
                <div className="no-tracking-content">
                    <div className="no-tracking-item">
                        <h3>No Tracking</h3>
                        <p>
                            We don't track your browsing habits, location, or personal information. 
                            Your interactions with CareConnect remain completely private.
                        </p>
                    </div>
                    <div className="no-tracking-item">
                        <h3>No Advertising</h3>
                        <p>
                            CareConnect is completely ad-free. We don't collect data for advertising 
                            purposes or share your information with advertisers.
                        </p>
                    </div>
                    <div className="no-tracking-item">
                        <h3>No Third Parties</h3>
                        <p>
                            We don't share your data with third parties, analytics services, or 
                            any external organizations. Your data stays with you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Data Control */}
            <section className="data-control-section">
                <h2 className="section-title">Complete Data Control</h2>
                <div className="control-content">
                    <div className="control-item">
                        <h3>Export Your Data</h3>
                        <p>
                            Export all your data in standard formats (JSON, CSV) for backup or 
                            transfer to other services.
                        </p>
                    </div>
                    <div className="control-item">
                        <h3>Delete Your Data</h3>
                        <p>
                            Permanently delete any or all of your data at any time. Deletion is 
                            immediate and irreversible.
                        </p>
                    </div>
                    <div className="control-item">
                        <h3>Control Settings</h3>
                        <p>
                            Fine-tune your privacy settings to control exactly what data is 
                            collected and how it's used.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="contact-section">
                <h2 className="section-title">Privacy Questions?</h2>
                <div className="contact-content">
                    <p>
                        If you have any questions about our privacy practices or how we handle your data, 
                        please don't hesitate to reach out.
                    </p>
                    <div className="contact-methods">
                        <div className="contact-method">
                            <h3>Community Support</h3>
                            <p>Ask questions in our community forums</p>
                        </div>
                        <div className="contact-method">
                            <h3>Documentation</h3>
                            <p>Review our detailed privacy documentation</p>
                        </div>
                        <div className="contact-method">
                            <h3>Feedback</h3>
                            <p>Share privacy-related feedback and suggestions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Last Updated */}
            <section className="last-updated-section">
                <div className="last-updated-content">
                    <p>
                        <strong>Last Updated:</strong> December 2024
                    </p>
                    <p>
                        This privacy policy is part of CareConnect v5.0 and may be updated as the 
                        platform evolves. All changes will be clearly communicated to users.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Privacy;
