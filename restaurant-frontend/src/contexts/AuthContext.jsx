import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkUserType, loginAdmin, logoutUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize from localStorage
        const savedUser = localStorage.getItem('auth_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const userData = await checkUserType();
            if (userData.is_authenticated) {
                setUser(userData);
                localStorage.setItem('auth_user', JSON.stringify(userData));
            } else {
                setUser(null);
                localStorage.removeItem('auth_user');
            }
        } catch (error) {
            console.log('No active session');
            setUser(null);
            localStorage.removeItem('auth_user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const result = await loginAdmin(username, password);
            if (result.user) {
                setUser(result.user);
                localStorage.setItem('auth_user', JSON.stringify(result.user));
                return { success: true };
            }
            return { success: false, error: result.error || 'Login failed' };
        } catch (error) {
            return { success: false, error: error.message || 'Network error' };
        }
    };

    const adminLogin = async (email, password) => {
        return await login(email, password);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('auth_user');
        }
    };

    const value = {
        user,
        isAdmin: user?.is_admin || false,
        login,
        adminLogin,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 