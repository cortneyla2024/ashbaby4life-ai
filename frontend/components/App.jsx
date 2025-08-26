import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { useTelemetry } from '../hooks/useTelemetry';

// Layout Components
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// Page Components
import Home from '../pages/Home';
import Health from '../pages/Health';
import Creativity from '../pages/Creativity';
import Finance from '../pages/Finance';
import Community from '../pages/Community';
import Settings from '../pages/Settings';
import About from '../pages/About';
import Privacy from '../pages/Privacy';

// UI Components
import Notification from './Notification';
import Modal from './Modal';
import ChatWidget from './ChatWidget';

// Hooks
import { useSession } from '../hooks/useSession';
import { useLocalStorage } from '../hooks/useLocalStorage';

const App = () => {
    const { isAuthenticated, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, clearNotification } = useNotifications();
    const { trackEvent } = useTelemetry();
    const { session } = useSession();
    const { getItem, setItem } = useLocalStorage();

    // Track app load
    React.useEffect(() => {
        trackEvent('app_loaded', {
            theme,
            isAuthenticated,
            timestamp: new Date().toISOString()
        });
    }, []);

    // Handle theme persistence
    React.useEffect(() => {
        setItem('theme', theme);
    }, [theme, setItem]);

    // Handle session persistence
    React.useEffect(() => {
        if (session) {
            setItem('session', JSON.stringify(session));
        }
    }, [session, setItem]);

    return (
        <div className={`app ${theme}`} data-theme={theme}>
            <ErrorBoundary>
                {/* Header */}
                <Header 
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onThemeToggle={toggleTheme}
                    theme={theme}
                />

                {/* Main Content */}
                <main className="main-content">
                    <div className="content-wrapper">
                        {/* Sidebar */}
                        <Sidebar isAuthenticated={isAuthenticated} />

                        {/* Page Content */}
                        <div className="page-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/health" element={<Health />} />
                                <Route path="/creativity" element={<Creativity />} />
                                <Route path="/finance" element={<Finance />} />
                                <Route path="/community" element={<Community />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/privacy" element={<Privacy />} />
                                
                                {/* Catch-all route */}
                                <Route path="*" element={<Home />} />
                            </Routes>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />

                {/* Chat Widget */}
                <ChatWidget />

                {/* Notifications */}
                <div className="notifications-container">
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            notification={notification}
                            onClose={() => clearNotification(notification.id)}
                        />
                    ))}
                </div>

                {/* Loading Spinner */}
                <LoadingSpinner />

                {/* Global Modal */}
                <Modal />
            </ErrorBoundary>
        </div>
    );
};

export default App;
