'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, AuthCredentials } from './auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted user on mount
    const loadUser = async () => {
      try {
        const persistedUser = authService.loadPersistedUser();
        if (persistedUser) {
          setUser(persistedUser);
        }
      } catch (error) {
        console.error('Error loading persisted user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    try {
      setLoading(true);
      const user = await authService.signIn(credentials);
      authService.persistUser(user);
      setUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: AuthCredentials) => {
    try {
      setLoading(true);
      const user = await authService.signUp(credentials);
      authService.persistUser(user);
      setUser(user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to sign in page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
  }, [user, loading]);

  return { user, loading };
}
