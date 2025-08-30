import { AuthService } from '@/lib/auth/authService';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import axios from 'axios';

// Mock dependencies
jest.mock('@/lib/auth/tokenStorage');
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

// Mock axios instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.create.mockReturnValue(mockAxiosInstance as any);
    AuthService.resetInstance();
    authService = AuthService.getInstance();
  });

  describe('Login', () => {
    const mockCredentials = {
      email: 'admin@example.com',
      password: 'password123',
    };

    const mockAuthResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    };

    it('should login successfully with valid credentials', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      const user = await authService.login(mockCredentials);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/login',
        mockCredentials
      );
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(
        mockAuthResponse.accessToken
      );
      expect(mockTokenStorage.setRefreshToken).toHaveBeenCalledWith(
        mockAuthResponse.refreshToken
      );
      expect(mockTokenStorage.setUser).toHaveBeenCalledWith(
        mockAuthResponse.user
      );
      expect(user).toEqual(mockAuthResponse.user);
    });

    it('should reject login for non-admin users', async () => {
      const nonAdminResponse = {
        ...mockAuthResponse,
        user: { ...mockAuthResponse.user, role: 'USER' },
      };

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: nonAdminResponse,
      });

      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Access denied. Admin privileges required.'
      );

      expect(mockTokenStorage.setAccessToken).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should handle 401 unauthorized error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { status: 401 },
      });

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should handle 429 account locked error', async () => {
      const lockoutMessage = 'Account locked for 15 minutes';
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { message: lockoutMessage },
        },
      });

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        lockoutMessage
      );
    });

    it('should handle generic API error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      });

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should handle network error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Login failed. Please try again.'
      );
    });
  });

  describe('Token Refresh', () => {
    const mockRefreshResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    };

    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      mockTokenStorage.getRefreshToken.mockReturnValue(refreshToken);
      mockTokenStorage.isRefreshTokenValid.mockReturnValue(true);
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockRefreshResponse,
      });

      const newToken = await authService.refreshAccessToken();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken,
      });
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(
        mockRefreshResponse.accessToken
      );
      expect(mockTokenStorage.setRefreshToken).toHaveBeenCalledWith(
        mockRefreshResponse.refreshToken
      );
      expect(newToken).toBe(mockRefreshResponse.accessToken);
    });

    it('should return null if no refresh token exists', async () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(null);
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      const newToken = await authService.refreshAccessToken();

      expect(newToken).toBeNull();
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should return null if refresh token is invalid', async () => {
      mockTokenStorage.getRefreshToken.mockReturnValue('invalid-token');
      mockTokenStorage.isRefreshTokenValid.mockReturnValue(false);
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      const newToken = await authService.refreshAccessToken();

      expect(newToken).toBeNull();
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should handle refresh failure', async () => {
      const refreshToken = 'valid-refresh-token';
      mockTokenStorage.getRefreshToken.mockReturnValue(refreshToken);
      mockTokenStorage.isRefreshTokenValid.mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { status: 401 },
      });
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      const newToken = await authService.refreshAccessToken();

      expect(newToken).toBeNull();
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  describe('Get Current User', () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    it('should get current user successfully', async () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(true);
      mockTokenStorage.isAccessTokenValid.mockReturnValue(true);
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUser });

      const user = await authService.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile');
      expect(mockTokenStorage.setUser).toHaveBeenCalledWith(mockUser);
      expect(user).toEqual(mockUser);
    });

    it('should return null if no valid access token', async () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(false);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it('should return null if token is invalid', async () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(true);
      mockTokenStorage.isAccessTokenValid.mockReturnValue(false);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(true);
      mockTokenStorage.isAccessTokenValid.mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 401 },
      });
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({});

      await authService.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockTokenStorage.clearAll).toHaveBeenCalled();
    });

    it('should clear local data even if backend logout fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(mockTokenStorage.clearAll).toHaveBeenCalled();
    });
  });

  describe('Authentication Status', () => {
    it('should return true if authenticated', () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(true);
      mockTokenStorage.isAccessTokenValid.mockReturnValue(true);

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if not authenticated', () => {
      mockTokenStorage.hasAccessToken.mockReturnValue(false);
      mockTokenStorage.isAccessTokenValid.mockReturnValue(false);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Admin Status', () => {
    it('should return true for admin user', () => {
      mockTokenStorage.getUser.mockReturnValue({
        id: 'user-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      expect(authService.isAdmin()).toBe(true);
    });

    it('should return false for non-admin user', () => {
      mockTokenStorage.getUser.mockReturnValue({
        id: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      expect(authService.isAdmin()).toBe(false);
    });

    it('should return false if no user data', () => {
      mockTokenStorage.getUser.mockReturnValue(null);

      expect(authService.isAdmin()).toBe(false);
    });
  });

  describe('Auto Refresh Token', () => {
    it('should refresh token when expiring soon', async () => {
      const expiringSoonToken = createTokenWithExp(Date.now() / 1000 + 200); // 200 seconds from now
      mockTokenStorage.hasRefreshToken.mockReturnValue(true);
      mockTokenStorage.getAccessToken.mockReturnValue(expiringSoonToken);
      
      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue('new-token');

      await authService.autoRefreshToken();

      expect(authService.refreshAccessToken).toHaveBeenCalled();
    });

    it('should not refresh token if not expiring soon', async () => {
      const validToken = createTokenWithExp(Date.now() / 1000 + 3600); // 1 hour from now
      mockTokenStorage.hasRefreshToken.mockReturnValue(true);
      mockTokenStorage.getAccessToken.mockReturnValue(validToken);
      
      jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue('new-token');

      await authService.autoRefreshToken();

      expect(authService.refreshAccessToken).not.toHaveBeenCalled();
    });

    it('should handle refresh failure gracefully', async () => {
      const expiringSoonToken = createTokenWithExp(Date.now() / 1000 + 200);
      mockTokenStorage.hasRefreshToken.mockReturnValue(true);
      mockTokenStorage.getAccessToken.mockReturnValue(expiringSoonToken);
      
      jest.spyOn(authService, 'refreshAccessToken').mockRejectedValue(new Error('Refresh failed'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await authService.autoRefreshToken();

      expect(consoleSpy).toHaveBeenCalledWith('Auto-refresh failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});

// Helper function to create a token with specific expiry
function createTokenWithExp(exp: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ exp, sub: 'user-id' })).toString('base64');
  const signature = 'signature';
  return `${header}.${payload}.${signature}`;
}