import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTelemetry } from '../hooks/useTelemetry';

// Icons
import { 
    ArrowRightIcon, 
    ExternalLinkIcon, 
    StarIcon,
    BookmarkIcon,
    ShareIcon,
    MoreIcon
} from '../assets/icons';

const DashboardCard = ({
    title,
    subtitle,
    content,
    icon,
    image,
    stats,
    actions = [],
    links = [],
    tags = [],
    variant = 'default',
    size = 'medium',
    interactive = true,
    loading = false,
    error = null,
    className = '',
    onClick,
    href,
    external = false,
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const { trackEvent } = useTelemetry();

    const handleClick = (e) => {
        if (loading || error) return;
        
        trackEvent('dashboard_card_clicked', {
            title,
            variant,
            size,
            hasHref: !!href
        });

        if (onClick) {
            onClick(e);
        }
    };

    const handleAction = (action) => {
        trackEvent('dashboard_card_action_clicked', {
            title,
            action: action.label
        });

        if (action.onClick) {
            action.onClick();
        }
    };

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const getVariantClass = () => {
        switch (variant) {
            case 'primary':
                return 'card-primary';
            case 'secondary':
                return 'card-secondary';
            case 'success':
                return 'card-success';
            case 'warning':
                return 'card-warning';
            case 'error':
                return 'card-error';
            case 'info':
                return 'card-info';
            case 'default':
            default:
                return 'card-default';
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case 'small':
                return 'card-small';
            case 'large':
                return 'card-large';
            case 'medium':
            default:
                return 'card-medium';
        }
    };

    const renderIcon = () => {
        if (!icon) return null;

        if (typeof icon === 'string') {
            return <div className="card-icon">{icon}</div>;
        }

        return <div className="card-icon">{icon}</div>;
    };

    const renderImage = () => {
        if (!image) return null;

        return (
            <div className="card-image">
                <img src={image.src} alt={image.alt || title} />
            </div>
        );
    };

    const renderStats = () => {
        if (!stats || stats.length === 0) return null;

        return (
            <div className="card-stats">
                {stats.map((stat, index) => (
                    <div key={index} className="card-stat">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                        {stat.trend && (
                            <span className={`stat-trend ${stat.trend > 0 ? 'positive' : 'negative'}`}>
                                {stat.trend > 0 ? '+' : ''}{stat.trend}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderActions = () => {
        if (!actions || actions.length === 0) return null;

        return (
            <div className="card-actions">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={`card-action ${action.variant || 'secondary'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction(action);
                        }}
                        disabled={action.disabled}
                    >
                        {action.icon && <span className="action-icon">{action.icon}</span>}
                        {action.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderLinks = () => {
        if (!links || links.length === 0) return null;

        return (
            <div className="card-links">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        to={link.href}
                        className="card-link"
                        onClick={(e) => {
                            e.stopPropagation();
                            trackEvent('dashboard_card_link_clicked', {
                                title,
                                link: link.href
                            });
                        }}
                    >
                        {link.label}
                        {link.external ? <ExternalLinkIcon /> : <ArrowRightIcon />}
                    </Link>
                ))}
            </div>
        );
    };

    const renderTags = () => {
        if (!tags || tags.length === 0) return null;

        return (
            <div className="card-tags">
                {tags.map((tag, index) => (
                    <span key={index} className="card-tag">
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    const renderMenu = () => {
        if (!interactive) return null;

        return (
            <div className="card-menu">
                <button
                    className="card-menu-toggle"
                    onClick={handleMenuToggle}
                    aria-label="Open menu"
                >
                    <MoreIcon />
                </button>
                {showMenu && (
                    <div className="card-menu-dropdown">
                        <button className="menu-item">
                            <StarIcon />
                            <span>Favorite</span>
                        </button>
                        <button className="menu-item">
                            <BookmarkIcon />
                            <span>Bookmark</span>
                        </button>
                        <button className="menu-item">
                            <ShareIcon />
                            <span>Share</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const cardContent = (
        <div
            className={`dashboard-card ${getVariantClass()} ${getSizeClass()} ${className} ${
                interactive ? 'interactive' : ''
            } ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            {...props}
        >
            {/* Card Header */}
            <div className="card-header">
                {renderIcon()}
                <div className="card-title-section">
                    <h3 className="card-title">{title}</h3>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
                {renderMenu()}
            </div>

            {/* Card Image */}
            {renderImage()}

            {/* Card Content */}
            <div className="card-content">
                {content && <div className="card-body">{content}</div>}
                {renderStats()}
                {renderTags()}
            </div>

            {/* Card Footer */}
            <div className="card-footer">
                {renderActions()}
                {renderLinks()}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="card-loading">
                    <div className="loading-shimmer"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="card-error">
                    <p className="error-message">{error}</p>
                </div>
            )}
        </div>
    );

    // Wrap in link if href is provided
    if (href) {
        if (external) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-link-wrapper"
                >
                    {cardContent}
                </a>
            );
        }

        return (
            <Link to={href} className="card-link-wrapper">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};

// DashboardCard Variants
DashboardCard.Stat = ({ title, value, subtitle, trend, icon, ...props }) => (
    <DashboardCard
        title={title}
        subtitle={subtitle}
        stats={[{ value, label: '', trend }]}
        icon={icon}
        size="small"
        variant="default"
        {...props}
    />
);

DashboardCard.Chart = ({ title, chart, subtitle, ...props }) => (
    <DashboardCard
        title={title}
        subtitle={subtitle}
        content={chart}
        size="large"
        variant="default"
        {...props}
    />
);

DashboardCard.News = ({ title, content, image, date, author, ...props }) => (
    <DashboardCard
        title={title}
        content={content}
        image={image}
        subtitle={`${date} • ${author}`}
        variant="info"
        {...props}
    />
);

DashboardCard.Action = ({ title, description, action, icon, ...props }) => (
    <DashboardCard
        title={title}
        content={description}
        icon={icon}
        actions={[action]}
        variant="primary"
        {...props}
    />
);

export default DashboardCard;
