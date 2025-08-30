'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from './authService';
import { AuthUser, AuthState } from './types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check authentication status on mount and when storage changes
  const checkAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // First check if we have valid tokens
      if (authService.isAuthenticated()) {
        // Try to get current user from API
        const user = await authService.getCurrentUser();
        
        if (user && user.role === 'ADMIN') {
          setAuthState({
            user,
            token: authService.getCurrentUserFromStorage()?.id || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      // No valid authentication
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      const user = await authService.login({ email, password });
      
      setAuthState({
        user,
        token: user.id,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<void> => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  // Setup auto-refresh timer
  useEffect(() => {
    // Initial auth check
    checkAuthStatus();

    // Setup auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      if (authState.isAuthenticated) {
        authService.autoRefreshToken().catch(console.error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [checkAuthStatus, authState.isAuthenticated]);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_user' && e.newValue === null) {
        // User was logged out in another tab
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (authState.isAuthenticated) {
        checkAuthStatus();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [authState.isAuthenticated, checkAuthStatus]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    isAdmin: authState.user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}

// Hook for admin-only routes
export function useRequireAdmin() {
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && !auth.isAdmin) {
      window.location.href = '/unauthorized';
    }
  }, [auth.isAuthenticated, auth.isAdmin, auth.isLoading]);

  return auth;
}