import { useState, useEffect, useContext, createContext } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTelemetry } from './useTelemetry';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { getItem, setItem, removeItem } = useLocalStorage();
    const { trackEvent } = useTelemetry();

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const savedUser = getItem('user');
                const savedToken = getItem('authToken');
                
                if (savedUser && savedToken) {
                    // Validate token with backend
                    const isValid = await validateToken(savedToken);
                    if (isValid) {
                        setUser(JSON.parse(savedUser));
                        setIsAuthenticated(true);
                        trackEvent('auth_auto_login_success');
                    } else {
                        // Clear invalid data
                        removeItem('user');
                        removeItem('authToken');
                        trackEvent('auth_auto_login_failed');
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                trackEvent('auth_initialization_error', { error: error.message });
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const validateToken = async (token) => {
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    };

    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        
        try {
            trackEvent('auth_login_attempt', { method: credentials.method || 'email' });
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            
            setUser(data.user);
            setIsAuthenticated(true);
            setItem('user', JSON.stringify(data.user));
            setItem('authToken', data.token);
            
            trackEvent('auth_login_success', { userId: data.user.id });
            
            return { success: true, user: data.user };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_login_error', { error: error.message });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            trackEvent('auth_register_attempt');
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            
            setUser(data.user);
            setIsAuthenticated(true);
            setItem('user', JSON.stringify(data.user));
            setItem('authToken', data.token);
            
            trackEvent('auth_register_success', { userId: data.user.id });
            
            return { success: true, user: data.user };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_register_error', { error: error.message });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            trackEvent('auth_logout_attempt');
            
            // Call logout endpoint
            const token = getItem('authToken');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            // Clear local state
            setUser(null);
            setIsAuthenticated(false);
            removeItem('user');
            removeItem('authToken');
            
            trackEvent('auth_logout_success');
        } catch (error) {
            console.error('Logout error:', error);
            trackEvent('auth_logout_error', { error: error.message });
            
            // Clear local state even if server call fails
            setUser(null);
            setIsAuthenticated(false);
            removeItem('user');
            removeItem('authToken');
        }
    };

    const updateProfile = async (updates) => {
        try {
            trackEvent('auth_profile_update_attempt');
            
            const token = getItem('authToken');
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Profile update failed');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setItem('user', JSON.stringify(updatedUser));
            
            trackEvent('auth_profile_update_success');
            
            return { success: true, user: updatedUser };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_profile_update_error', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            trackEvent('auth_password_change_attempt');
            
            const token = getItem('authToken');
            const response = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                throw new Error('Password change failed');
            }
            
            trackEvent('auth_password_change_success');
            
            return { success: true };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_password_change_error', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    const forgotPassword = async (email) => {
        try {
            trackEvent('auth_forgot_password_attempt');
            
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Password reset request failed');
            }
            
            trackEvent('auth_forgot_password_success');
            
            return { success: true };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_forgot_password_error', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            trackEvent('auth_reset_password_attempt');
            
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            if (!response.ok) {
                throw new Error('Password reset failed');
            }
            
            trackEvent('auth_reset_password_success');
            
            return { success: true };
        } catch (error) {
            setError(error.message);
            trackEvent('auth_reset_password_error', { error: error.message });
            return { success: false, error: error.message };
        }
    };

    const refreshToken = async () => {
        try {
            const currentToken = getItem('authToken');
            if (!currentToken) {
                throw new Error('No token to refresh');
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            setItem('authToken', data.token);
            
            trackEvent('auth_token_refresh_success');
            
            return { success: true, token: data.token };
        } catch (error) {
            console.error('Token refresh error:', error);
            trackEvent('auth_token_refresh_error', { error: error.message });
            
            // If refresh fails, logout user
            await logout();
            
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
