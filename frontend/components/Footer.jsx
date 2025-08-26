import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useTelemetry } from '../hooks/useTelemetry';

const Footer = () => {
    const { theme } = useTheme();
    const { trackEvent } = useTelemetry();

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', path: '/features' },
            { label: 'Pricing', path: '/pricing' },
            { label: 'Roadmap', path: '/roadmap' },
            { label: 'Changelog', path: '/changelog' }
        ],
        support: [
            { label: 'Help Center', path: '/help' },
            { label: 'Documentation', path: '/docs' },
            { label: 'Contact', path: '/contact' },
            { label: 'Status', path: '/status' }
        ],
        legal: [
            { label: 'Privacy Policy', path: '/privacy' },
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Cookie Policy', path: '/cookies' },
            { label: 'GDPR', path: '/gdpr' }
        ],
        company: [
            { label: 'About', path: '/about' },
            { label: 'Blog', path: '/blog' },
            { label: 'Careers', path: '/careers' },
            { label: 'Press', path: '/press' }
        ]
    };

    const socialLinks = [
        { name: 'GitHub', url: 'https://github.com/careconnect', icon: 'github' },
        { name: 'Twitter', url: 'https://twitter.com/careconnect', icon: 'twitter' },
        { name: 'Discord', url: 'https://discord.gg/careconnect', icon: 'discord' },
        { name: 'LinkedIn', url: 'https://linkedin.com/company/careconnect', icon: 'linkedin' }
    ];

    const handleLinkClick = (category, label) => {
        trackEvent('footer_link_clicked', { category, label });
    };

    const handleSocialClick = (platform) => {
        trackEvent('social_link_clicked', { platform });
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Main Footer Content */}
                <div className="footer-main">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <Link to="/" className="logo-link">
                                <div className="logo-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none"/>
                                        <path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                    </svg>
                                </div>
                                <span className="logo-text">CareConnect</span>
                            </Link>
                        </div>
                        <p className="footer-description">
                            Your personal AI companion for life management, wellness, and growth. 
                            Privacy-first, self-evolving, and always here for you.
                        </p>
                        <div className="footer-social">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    onClick={() => handleSocialClick(social.name.toLowerCase())}
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    <i className={`icon-${social.icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="footer-links">
                        <div className="footer-section">
                            <h3 className="footer-section-title">Product</h3>
                            <ul className="footer-links-list">
                                {footerLinks.product.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="footer-link"
                                            onClick={() => handleLinkClick('product', link.label)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-section-title">Support</h3>
                            <ul className="footer-links-list">
                                {footerLinks.support.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="footer-link"
                                            onClick={() => handleLinkClick('support', link.label)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-section-title">Legal</h3>
                            <ul className="footer-links-list">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="footer-link"
                                            onClick={() => handleLinkClick('legal', link.label)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h3 className="footer-section-title">Company</h3>
                            <ul className="footer-links-list">
                                {footerLinks.company.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="footer-link"
                                            onClick={() => handleLinkClick('company', link.label)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <div className="footer-copyright">
                            <p>
                                © {currentYear} CareConnect. All rights reserved.
                                <span className="footer-version"> v5.0 - The Steward</span>
                            </p>
                        </div>
                        <div className="footer-extra">
                            <span className="footer-status">
                                <span className="status-indicator online"></span>
                                System Online
                            </span>
                            <span className="footer-privacy">
                                🔒 Privacy-First • 🚀 Self-Evolving • 🤖 AI-Powered
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Border */}
            <div className="footer-border">
                <div className="border-pattern"></div>
            </div>
        </footer>
    );
};

export default Footer;
