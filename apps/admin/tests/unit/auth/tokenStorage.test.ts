import { tokenStorage } from '@/lib/auth/tokenStorage';
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie');
const mockCookies = Cookies as jest.Mocked<typeof Cookies>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('TokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    // Clear tokenStorage internal state
    tokenStorage.removeAccessToken();
    tokenStorage.removeRefreshToken();
  });

  describe('Access Token Management', () => {
    it('should set access token in memory and cookie', () => {
      const token = 'test-access-token';
      
      tokenStorage.setAccessToken(token);
      
      expect(mockCookies.set).toHaveBeenCalledWith(
        'admin_access_token',
        token,
        {
          secure: false, // In test environment
          httpOnly: false,
          sameSite: 'strict',
          expires: 1/24, // 1 hour
        }
      );
    });

    it('should get access token from memory first', () => {
      const token = 'test-access-token';
      tokenStorage.setAccessToken(token);
      
      const retrievedToken = tokenStorage.getAccessToken();
      
      expect(retrievedToken).toBe(token);
      expect(mockCookies.get).not.toHaveBeenCalled();
    });

    it('should fallback to cookie if not in memory', () => {
      const token = 'cookie-token';
      mockCookies.get.mockReturnValue(token);
      
      const retrievedToken = tokenStorage.getAccessToken();
      
      expect(retrievedToken).toBe(token);
      expect(mockCookies.get).toHaveBeenCalledWith('admin_access_token');
    });

    it('should return null if no access token exists', () => {
      mockCookies.get.mockReturnValue(undefined);
      
      const retrievedToken = tokenStorage.getAccessToken();
      
      expect(retrievedToken).toBeNull();
    });

    it('should remove access token from memory and cookie', () => {
      tokenStorage.removeAccessToken();
      
      expect(mockCookies.remove).toHaveBeenCalledWith('admin_access_token');
    });
  });

  describe('Refresh Token Management', () => {
    it('should set refresh token in cookie', () => {
      const token = 'test-refresh-token';
      
      tokenStorage.setRefreshToken(token);
      
      expect(mockCookies.set).toHaveBeenCalledWith(
        'admin_refresh_token',
        token,
        {
          secure: false, // In test environment
          httpOnly: false,
          sameSite: 'strict',
          expires: 7, // 7 days
        }
      );
    });

    it('should get refresh token from cookie', () => {
      const token = 'test-refresh-token';
      mockCookies.get.mockReturnValue(token);
      
      const retrievedToken = tokenStorage.getRefreshToken();
      
      expect(retrievedToken).toBe(token);
      expect(mockCookies.get).toHaveBeenCalledWith('admin_refresh_token');
    });

    it('should remove refresh token from cookie', () => {
      tokenStorage.removeRefreshToken();
      
      expect(mockCookies.remove).toHaveBeenCalledWith('admin_refresh_token');
    });
  });

  describe('User Data Management', () => {
    it('should set user data in localStorage', () => {
      const user = { id: '1', email: 'test@example.com', role: 'ADMIN' };
      
      tokenStorage.setUser(user);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'admin_user',
        JSON.stringify(user)
      );
    });

    it('should get user data from localStorage', () => {
      const user = { id: '1', email: 'test@example.com', role: 'ADMIN' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user));
      
      const retrievedUser = tokenStorage.getUser();
      
      expect(retrievedUser).toEqual(user);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('admin_user');
    });

    it('should return null for invalid user data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const retrievedUser = tokenStorage.getUser();
      
      expect(retrievedUser).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin_user');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should remove user data from localStorage', () => {
      tokenStorage.removeUser();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin_user');
    });
  });

  describe('Token Validation', () => {
    const createValidToken = (exp: number) => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ exp, sub: 'user-id' })).toString('base64');
      const signature = 'signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should validate access token expiry', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
      const validToken = createValidToken(futureExp);
      tokenStorage.setAccessToken(validToken);
      
      const isValid = tokenStorage.isAccessTokenValid();
      
      expect(isValid).toBe(true);
    });

    it('should reject expired access token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
      const expiredToken = createValidToken(pastExp);
      tokenStorage.setAccessToken(expiredToken);
      
      const isValid = tokenStorage.isAccessTokenValid();
      
      expect(isValid).toBe(false);
    });

    it('should reject invalid token format', () => {
      tokenStorage.setAccessToken('invalid-token-format');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const isValid = tokenStorage.isAccessTokenValid();
      
      expect(isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCookies.remove).toHaveBeenCalledWith('admin_access_token');
      
      consoleSpy.mockRestore();
    });

    it('should validate refresh token expiry', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 604800; // 7 days in the future
      const validToken = createValidToken(futureExp);
      mockCookies.get.mockReturnValue(validToken);
      
      const isValid = tokenStorage.isRefreshTokenValid();
      
      expect(isValid).toBe(true);
    });

    it('should reject expired refresh token', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
      const expiredToken = createValidToken(pastExp);
      mockCookies.get.mockReturnValue(expiredToken);
      
      const isValid = tokenStorage.isRefreshTokenValid();
      
      expect(isValid).toBe(false);
    });
  });

  describe('Clear All Data', () => {
    it('should clear all stored data', () => {
      tokenStorage.clearAll();
      
      expect(mockCookies.remove).toHaveBeenCalledWith('admin_access_token');
      expect(mockCookies.remove).toHaveBeenCalledWith('admin_refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin_user');
    });
  });

  describe('Token Existence Checks', () => {
    it('should check if access token exists', () => {
      tokenStorage.setAccessToken('test-token');
      
      expect(tokenStorage.hasAccessToken()).toBe(true);
    });

    it('should check if refresh token exists', () => {
      mockCookies.get.mockReturnValue('test-refresh-token');
      
      expect(tokenStorage.hasRefreshToken()).toBe(true);
    });

    it('should return false for non-existent tokens', () => {
      mockCookies.get.mockReturnValue(undefined);
      
      expect(tokenStorage.hasAccessToken()).toBe(false);
      expect(tokenStorage.hasRefreshToken()).toBe(false);
    });
  });
});