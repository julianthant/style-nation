import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenStorage } from './tokenStorage';
import { 
  LoginCredentials, 
  AuthResponse, 
  AuthUser, 
  RefreshTokenRequest,
  AUTH_ENDPOINTS 
} from './types';

/**
 * Authentication service for admin panel
 * Handles all JWT authentication operations with the backend API
 */
export class AuthService {
  private static instance: AuthService;
  private apiClient: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });

    this.setupInterceptors();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes only)
   * @internal
   */
  public static resetInstance(): void {
    AuthService.instance = undefined as any;
  }

  private setupInterceptors(): void {
    // Request interceptor: Add auth token to requests
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getAccessToken();
        if (token && tokenStorage.isAccessTokenValid()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh on 401
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.apiClient(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Admin login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(user);

      // Verify user is admin
      if (user.role !== 'ADMIN') {
        this.logout();
        throw new Error('Access denied. Admin privileges required.');
      }

      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || 'Account temporarily locked due to too many failed attempts';
        throw new Error(message);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Login failed. Please try again.');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken || !tokenStorage.isRefreshTokenValid()) {
      this.logout();
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string | null> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post(
        AUTH_ENDPOINTS.REFRESH,
        { refreshToken } as RefreshTokenRequest
      );

      const { accessToken, refreshToken: newRefreshToken, user } = response.data;

      // Update stored tokens
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(newRefreshToken);
      tokenStorage.setUser(user);

      return accessToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Get current user profile from API
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!tokenStorage.hasAccessToken() || !tokenStorage.isAccessTokenValid()) {
        return null;
      }

      const response: AxiosResponse<AuthUser> = await this.apiClient.get(
        AUTH_ENDPOINTS.PROFILE
      );

      const user = response.data;
      tokenStorage.setUser(user);
      return user;
    } catch (error: any) {
      console.error('Failed to get current user:', error);
      if (error.response?.status === 401) {
        this.logout();
      }
      return null;
    }
  }

  /**
   * Logout and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify backend of logout
      await this.apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Backend logout failed, but we still need to clear local data
      console.warn('Backend logout failed:', error);
    } finally {
      // Always clear local storage
      tokenStorage.clearAll();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasAccessToken() && tokenStorage.isAccessTokenValid();
  }

  /**
   * Get current user from storage (no API call)
   */
  getCurrentUserFromStorage(): AuthUser | null {
    return tokenStorage.getUser();
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.role === 'ADMIN';
  }

  /**
   * Auto-refresh token before expiration
   * Should be called periodically (e.g., every 5 minutes)
   */
  async autoRefreshToken(): Promise<void> {
    if (!tokenStorage.hasRefreshToken()) return;

    try {
      const token = tokenStorage.getAccessToken();
      if (!token) return;

      // Check if token expires within next 5 minutes
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh if token expires within 5 minutes (300 seconds)
      if (timeUntilExpiry < 300) {
        await this.refreshAccessToken();
      }
    } catch (error) {
      console.warn('Auto-refresh failed:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();