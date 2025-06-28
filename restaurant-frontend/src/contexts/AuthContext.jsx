import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkUserType, loginUser, loginAdmin, logoutUser, fetchCSRFToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: true,
        error: null
    });

    const checkAuthStatus = async () => {
        try {
            const data = await checkUserType();
            
            const newAuthState = {
                isAuthenticated: data.is_authenticated,
                isAdmin: data.is_admin,
                user: data.is_authenticated ? {
                    id: data.user_id,
                    username: data.username,
                    email: data.email,
                    is_admin: data.is_admin,
                    is_customer: data.is_customer
                } : null,
                loading: false,
                error: null
            };
            
            setAuthState(newAuthState);
        } catch (error) {
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                user: null,
                loading: false,
                error: error.message
            });
        }
    };

    const login = async (credentials) => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            const data = await loginUser(credentials);
            
            // After successful login, check auth status
            await checkAuthStatus();
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            return { success: false, error: error.message };
        }
    };

    const adminLogin = async (credentials) => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            const data = await loginAdmin(credentials);
            
            // After successful login, check auth status
            await checkAuthStatus();
            return { success: true };
        } catch (error) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            // Ignore logout errors
        } finally {
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                user: null,
                loading: false,
                error: null
            });
            localStorage.removeItem('session_key');
        }
    };

    // Initialize auth on app start
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to fetch CSRF token on app init
                const token = await fetchCSRFToken();
                
                // Check if user is already authenticated
                try {
                    const userData = await checkUserType();
                    if (userData && userData.is_authenticated) {
                        setAuthState(prev => ({
                            ...prev,
                            isAuthenticated: true,
                            isAdmin: userData.is_admin || false,
                            user: {
                                id: userData.user_id,
                                username: userData.username,
                                email: userData.email,
                                is_admin: userData.is_admin || false,
                                is_customer: userData.is_customer || false
                            }
                        }));
                    }
                } catch (error) {
                    // User not authenticated, that's fine
                }
            } catch (error) {
                // Failed to initialize auth, but don't break the app
            } finally {
                setAuthState(prev => ({ ...prev, loading: false }));
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            ...authState, 
            login, 
            adminLogin, 
            logout, 
            checkAuthStatus 
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 