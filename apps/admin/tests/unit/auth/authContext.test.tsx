import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/authContext';

jest.mock('@/lib/auth/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    getCurrentUserFromStorage: jest.fn(),
    isAuthenticated: jest.fn(),
    isAdmin: jest.fn(),
    refreshAccessToken: jest.fn(),
    autoRefreshToken: jest.fn(),
  },
}));

import { authService } from '@/lib/auth/authService';
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3002/dashboard',
  },
  writable: true,
});

// Test component that uses the auth context
function TestComponent() {
  const { user, isAuthenticated, isAdmin, isLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="admin">{isAdmin.toString()}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(null);
  });

  it('should provide initial auth state', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('should authenticate user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('admin')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
  });

  it('should handle login successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    mockAuthService.login.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Click login button
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('admin')).toHaveTextContent('true');
  });

  it('should handle login failure', async () => {
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValue(loginError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // Should remain unauthenticated after failed login
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should handle logout successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    // Start with authenticated user
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for authentication to load
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Mock window.location.href assignment
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
      },
      writable: true,
    });

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('should handle logout failure gracefully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    // Start with authenticated user
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });

    // Should still clear local state and redirect even if API call fails
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(window.location.href).toBe('/login');
  });

  it('should reject non-admin users', async () => {
    const nonAdminUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    };

    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockResolvedValue(nonAdminUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Should not be authenticated even if API returns user (non-admin)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });

  it('should handle API error during auth check', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(consoleSpy).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});

// Test the refresh authentication function
describe('AuthContext Refresh', () => {
  function RefreshTestComponent() {
    const { refreshAuth } = useAuth();

    return (
      <div>
        <button onClick={() => refreshAuth()}>Refresh</button>
      </div>
    );
  }

  it('should refresh authentication state', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    // Initially not authenticated
    mockAuthService.isAuthenticated.mockReturnValueOnce(false);
    mockAuthService.getCurrentUser.mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <TestComponent />
        <RefreshTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    // Mock authentication becoming valid
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const refreshButton = screen.getByText('Refresh');
    
    await act(async () => {
      refreshButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
  });
});