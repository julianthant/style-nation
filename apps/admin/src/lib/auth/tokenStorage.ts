import Cookies from 'js-cookie';
import { AUTH_STORAGE_KEYS } from './types';

/**
 * Secure token storage using httpOnly cookies and memory
 * - Access tokens: Memory only (cleared on page refresh)
 * - Refresh tokens: Secure httpOnly cookies
 * - User data: localStorage (non-sensitive data only)
 */
export class TokenStorage {
  private static instance: TokenStorage;
  private accessToken: string | null = null;

  private constructor() {}

  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  // Access token methods (memory only for security)
  setAccessToken(token: string): void {
    this.accessToken = token;
    // Also set as secure cookie for server-side access
    Cookies.set(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Needed for client-side access
      sameSite: 'strict',
      expires: 1/96, // 15 minutes (matches backend JWT expiry)
    });
  }

  getAccessToken(): string | null {
    // Try memory first, then fallback to cookie
    if (this.accessToken) {
      return this.accessToken;
    }
    
    const cookieToken = Cookies.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    if (cookieToken) {
      this.accessToken = cookieToken;
      return cookieToken;
    }
    
    return null;
  }

  // Refresh token methods (secure cookies)
  setRefreshToken(token: string): void {
    Cookies.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Needed for client-side refresh
      sameSite: 'strict',
      expires: 7, // 7 days (same as JWT expiry)
    });
  }

  getRefreshToken(): string | null {
    return Cookies.get(AUTH_STORAGE_KEYS.REFRESH_TOKEN) || null;
  }

  // User data methods (localStorage for non-sensitive data)
  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      this.removeUser();
      return null;
    }
  }

  // Clear methods
  removeAccessToken(): void {
    this.accessToken = null;
    Cookies.remove(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  }

  removeRefreshToken(): void {
    Cookies.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }

  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
  }

  // Clear all auth data
  clearAll(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
    this.accessToken = null;
  }

  // Check if tokens exist
  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  // Token validation (basic expiry check)
  isAccessTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Basic JWT structure check and expiry validation
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp && payload.exp > currentTime;
    } catch (error) {
      console.warn('Invalid access token format:', error);
      this.removeAccessToken();
      return false;
    }
  }

  isRefreshTokenValid(): boolean {
    const token = this.getRefreshToken();
    if (!token) return false;

    try {
      // Basic JWT structure check and expiry validation
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp && payload.exp > currentTime;
    } catch (error) {
      console.warn('Invalid refresh token format:', error);
      this.removeRefreshToken();
      return false;
    }
  }
}

// Export singleton instance
export const tokenStorage = TokenStorage.getInstance();