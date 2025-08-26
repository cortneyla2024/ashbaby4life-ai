import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import page components
import Home from './pages/Home';
import Health from './pages/Health';
import Creativity from './pages/Creativity';
import Finance from './pages/Finance';
import Community from './pages/Community';
import Settings from './pages/Settings';
import About from './pages/About';
import Privacy from './pages/Privacy';

// Import components
import App from './components/App';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Import hooks
import { useAuth } from './hooks/useAuth';

// Lazy loading for better performance
const LazyHome = React.lazy(() => import('./pages/Home'));
const LazyHealth = React.lazy(() => import('./pages/Health'));
const LazyCreativity = React.lazy(() => import('./pages/Creativity'));
const LazyFinance = React.lazy(() => import('./pages/Finance'));
const LazyCommunity = React.lazy(() => import('./pages/Community'));
const LazySettings = React.lazy(() => import('./pages/Settings'));
const LazyAbout = React.lazy(() => import('./pages/About'));
const LazyPrivacy = React.lazy(() => import('./pages/Privacy'));

// Route configuration
const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyHome />
          </React.Suspense>
        ),
        meta: {
          title: 'Home - CareConnect v5.0',
          description: 'Welcome to CareConnect v5.0 - Your autonomous AI companion for holistic well-being',
          requiresAuth: false
        }
      },
      {
        path: 'health',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyHealth />
          </React.Suspense>
        ),
        meta: {
          title: 'Health & Wellness - CareConnect v5.0',
          description: 'Monitor and improve your health and wellness with AI-powered insights',
          requiresAuth: true
        }
      },
      {
        path: 'creativity',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyCreativity />
          </React.Suspense>
        ),
        meta: {
          title: 'Creativity Studio - CareConnect v5.0',
          description: 'Unleash your creativity with AI-powered tools and inspiration',
          requiresAuth: true
        }
      },
      {
        path: 'finance',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyFinance />
          </React.Suspense>
        ),
        meta: {
          title: 'Financial Planning - CareConnect v5.0',
          description: 'Plan and manage your finances with intelligent insights',
          requiresAuth: true
        }
      },
      {
        path: 'community',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyCommunity />
          </React.Suspense>
        ),
        meta: {
          title: 'Community - CareConnect v5.0',
          description: 'Connect with others and build meaningful relationships',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazySettings />
          </React.Suspense>
        ),
        meta: {
          title: 'Settings - CareConnect v5.0',
          description: 'Customize your CareConnect experience',
          requiresAuth: true
        }
      },
      {
        path: 'about',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyAbout />
          </React.Suspense>
        ),
        meta: {
          title: 'About - CareConnect v5.0',
          description: 'Learn about CareConnect v5.0 and its mission',
          requiresAuth: false
        }
      },
      {
        path: 'privacy',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <LazyPrivacy />
          </React.Suspense>
        ),
        meta: {
          title: 'Privacy Policy - CareConnect v5.0',
          description: 'Your privacy and data protection',
          requiresAuth: false
        }
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

// Create router instance
const router = createBrowserRouter(routes, {
  basename: process.env.NODE_ENV === 'production' ? '/careconnect' : '/'
});

// Route guard component
export const RouteGuard = ({ children, requireAuth = false }) => {
  const { user } = useAuth();
  
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Navigation configuration
export const navigationConfig = {
  main: [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Health', path: '/health', icon: 'health', requiresAuth: true },
    { name: 'Creativity', path: '/creativity', icon: 'creativity', requiresAuth: true },
    { name: 'Finance', path: '/finance', icon: 'finance', requiresAuth: true },
    { name: 'Community', path: '/community', icon: 'community', requiresAuth: true }
  ],
  secondary: [
    { name: 'Settings', path: '/settings', icon: 'settings', requiresAuth: true },
    { name: 'About', path: '/about', icon: 'info' },
    { name: 'Privacy', path: '/privacy', icon: 'shield' }
  ]
};

// Route utilities
export const routeUtils = {
  // Get route by path
  getRouteByPath: (path) => {
    return routes[0].children.find(route => route.path === path);
  },
  
  // Get route metadata
  getRouteMeta: (path) => {
    const route = routeUtils.getRouteByPath(path);
    return route?.meta || {};
  },
  
  // Check if route requires authentication
  requiresAuth: (path) => {
    const meta = routeUtils.getRouteMeta(path);
    return meta.requiresAuth || false;
  },
  
  // Get page title
  getPageTitle: (path) => {
    const meta = routeUtils.getRouteMeta(path);
    return meta.title || 'CareConnect v5.0';
  },
  
  // Get page description
  getPageDescription: (path) => {
    const meta = routeUtils.getRouteMeta(path);
    return meta.description || 'CareConnect v5.0 - Your autonomous AI companion';
  },
  
  // Update document title and meta
  updatePageMeta: (path) => {
    const title = routeUtils.getPageTitle(path);
    const description = routeUtils.getPageDescription(path);
    
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;
  }
};

// Navigation history tracking
export const navigationHistory = {
  history: [],
  maxEntries: 50,
  
  add: (path, title) => {
    const entry = {
      path,
      title,
      timestamp: new Date().toISOString()
    };
    
    navigationHistory.history.unshift(entry);
    
    // Keep only the last maxEntries
    if (navigationHistory.history.length > navigationHistory.maxEntries) {
      navigationHistory.history = navigationHistory.history.slice(0, navigationHistory.maxEntries);
    }
    
    // Store in localStorage
    try {
      localStorage.setItem('navigationHistory', JSON.stringify(navigationHistory.history));
    } catch (error) {
      console.warn('Failed to save navigation history:', error);
    }
  },
  
  get: () => {
    return navigationHistory.history;
  },
  
  clear: () => {
    navigationHistory.history = [];
    try {
      localStorage.removeItem('navigationHistory');
    } catch (error) {
      console.warn('Failed to clear navigation history:', error);
    }
  },
  
  load: () => {
    try {
      const stored = localStorage.getItem('navigationHistory');
      if (stored) {
        navigationHistory.history = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load navigation history:', error);
    }
  }
};

// Initialize navigation history
navigationHistory.load();

export default router;
