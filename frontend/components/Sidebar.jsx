import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useNotifications } from '../hooks/useNotifications';

// Icons
import { 
    HomeIcon, 
    HeartIcon, 
    BrainIcon, 
    DollarIcon, 
    UsersIcon,
    CogIcon,
    ChartIcon,
    CalendarIcon,
    BookmarkIcon,
    StarIcon,
    PlusIcon,
    SearchIcon,
    BellIcon,
    UserIcon
} from '../assets/icons';

const Sidebar = ({ isAuthenticated }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const { user } = useAuth();
    const { trackEvent } = useTelemetry();
    const { notifications } = useNotifications();

    const navigationItems = [
        { path: '/', label: 'Home', icon: HomeIcon, badge: null },
        { path: '/health', label: 'Health', icon: HeartIcon, badge: null },
        { path: '/creativity', label: 'Creativity', icon: BrainIcon, badge: null },
        { path: '/finance', label: 'Finance', icon: DollarIcon, badge: null },
        { path: '/community', label: 'Community', icon: UsersIcon, badge: null },
    ];

    const quickActions = [
        { label: 'New Goal', icon: PlusIcon, action: 'create_goal' },
        { label: 'Schedule', icon: CalendarIcon, action: 'open_schedule' },
        { label: 'Analytics', icon: ChartIcon, action: 'open_analytics' },
        { label: 'Bookmarks', icon: BookmarkIcon, action: 'open_bookmarks' },
    ];

    const recentItems = [
        { label: 'Morning Routine', type: 'routine', path: '/health/routines' },
        { label: 'Budget Review', type: 'finance', path: '/finance/budget' },
        { label: 'Creative Project', type: 'creativity', path: '/creativity/projects' },
        { label: 'Community Post', type: 'community', path: '/community/posts' },
    ];

    const handleNavigationClick = (path) => {
        trackEvent('sidebar_navigation_clicked', { path });
    };

    const handleQuickAction = (action) => {
        trackEvent('sidebar_quick_action_clicked', { action });
        // Handle quick actions
        switch (action) {
            case 'create_goal':
                // Open goal creation modal
                break;
            case 'open_schedule':
                // Navigate to schedule
                break;
            case 'open_analytics':
                // Navigate to analytics
                break;
            case 'open_bookmarks':
                // Navigate to bookmarks
                break;
            default:
                break;
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        trackEvent('sidebar_search_performed', { query: searchQuery });
        // Handle search
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        trackEvent('sidebar_toggle_collapse', { isCollapsed: !isCollapsed });
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-container">
                {/* Search Bar */}
                <div className="sidebar-search">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </form>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <h3 className="nav-section-title">Navigation</h3>
                        <ul className="nav-list">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`nav-item ${isActive ? 'active' : ''}`}
                                            onClick={() => handleNavigationClick(item.path)}
                                        >
                                            <Icon className="nav-icon" />
                                            <span className="nav-label">{item.label}</span>
                                            {item.badge && (
                                                <span className="nav-badge">{item.badge}</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Quick Actions */}
                    <div className="nav-section">
                        <h3 className="nav-section-title">Quick Actions</h3>
                        <ul className="nav-list">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                
                                return (
                                    <li key={action.action}>
                                        <button
                                            className="nav-item action-item"
                                            onClick={() => handleQuickAction(action.action)}
                                        >
                                            <Icon className="nav-icon" />
                                            <span className="nav-label">{action.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Recent Items */}
                    <div className="nav-section">
                        <h3 className="nav-section-title">Recent</h3>
                        <ul className="nav-list">
                            {recentItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className="nav-item recent-item"
                                        onClick={() => trackEvent('sidebar_recent_clicked', { path: item.path })}
                                    >
                                        <span className="item-type">{item.type}</span>
                                        <span className="item-label">{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* User Section */}
                {isAuthenticated && (
                    <div className="sidebar-user">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <UserIcon />
                                )}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span className="user-status">Online</span>
                            </div>
                        </div>
                        <div className="user-actions">
                            <Link to="/settings" className="user-action">
                                <CogIcon />
                            </Link>
                            <button className="user-action notifications-toggle">
                                <BellIcon />
                                {unreadNotifications > 0 && (
                                    <span className="notification-badge">{unreadNotifications}</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Collapse Toggle */}
                <button
                    className="sidebar-toggle"
                    onClick={toggleCollapse}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="toggle-icon"></span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
