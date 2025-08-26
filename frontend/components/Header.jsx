import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useTelemetry } from '../hooks/useTelemetry';

// Icons
import { 
    HomeIcon, 
    UserIcon, 
    BellIcon, 
    CogIcon, 
    SunIcon, 
    MoonIcon,
    MenuIcon,
    XIcon,
    HeartIcon,
    BrainIcon,
    DollarIcon,
    UsersIcon
} from '../assets/icons';

const Header = ({ user, isAuthenticated, onThemeToggle, theme }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();
    const { notifications } = useNotifications();
    const { trackEvent } = useTelemetry();

    const navigationItems = [
        { path: '/', label: 'Home', icon: HomeIcon },
        { path: '/health', label: 'Health', icon: HeartIcon },
        { path: '/creativity', label: 'Creativity', icon: BrainIcon },
        { path: '/finance', label: 'Finance', icon: DollarIcon },
        { path: '/community', label: 'Community', icon: UsersIcon },
    ];

    const handleThemeToggle = () => {
        onThemeToggle();
        trackEvent('theme_toggled', { newTheme: theme === 'light' ? 'dark' : 'light' });
    };

    const handleLogout = () => {
        logout();
        trackEvent('user_logged_out');
        setIsUserMenuOpen(false);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        trackEvent('mobile_menu_toggled', { isOpen: !isMobileMenuOpen });
    };

    const handleUserMenuToggle = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="header-logo">
                    <Link to="/" className="logo-link">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="16" cy="16" r="4" fill="currentColor"/>
                            </svg>
                        </div>
                        <span className="logo-text">CareConnect</span>
                        <span className="logo-version">v5.0</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => trackEvent('navigation_clicked', { path: item.path })}
                            >
                                <Icon className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Header Actions */}
                <div className="header-actions">
                    {/* Theme Toggle */}
                    <button
                        className="header-action theme-toggle"
                        onClick={handleThemeToggle}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    >
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>

                    {/* Notifications */}
                    <button
                        className="header-action notifications-toggle"
                        onClick={() => trackEvent('notifications_opened')}
                        aria-label="Open notifications"
                    >
                        <BellIcon />
                        {unreadNotifications > 0 && (
                            <span className="notification-badge">{unreadNotifications}</span>
                        )}
                    </button>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="user-menu-container">
                            <button
                                className="header-action user-menu-toggle"
                                onClick={handleUserMenuToggle}
                                aria-label="Open user menu"
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                                ) : (
                                    <UserIcon />
                                )}
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-menu">
                                    <div className="user-menu-header">
                                        <div className="user-info">
                                            <span className="user-name">{user?.name || 'User'}</span>
                                            <span className="user-email">{user?.email}</span>
                                        </div>
                                    </div>
                                    <div className="user-menu-items">
                                        <Link
                                            to="/settings"
                                            className="user-menu-item"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <CogIcon />
                                            <span>Settings</span>
                                        </Link>
                                        <button
                                            className="user-menu-item"
                                            onClick={handleLogout}
                                        >
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-button">
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="header-action mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <nav className="header-nav mobile-nav">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    trackEvent('mobile_navigation_clicked', { path: item.path });
                                }}
                            >
                                <Icon className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </header>
    );
};

export default Header;
