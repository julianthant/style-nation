# API Integration Guide

## Backend API Connection

### Base Configuration
```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

### Authentication Endpoints

#### POST `/auth/login`
Admin login with email and password.

**Request:**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Response (Success):**
```typescript
interface AuthResponse {
  accessToken: string;      // JWT token (15 min expiry)
  refreshToken: string;     // Refresh token (7 day expiry)
  user: AuthUser;          // User profile with role
}

interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN';           // Only ADMIN role allowed
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}
```

**Error Responses:**
- `401`: Invalid credentials
- `429`: Account locked (too many failed attempts)
- `500`: Server error

#### POST `/auth/refresh`
Refresh expired access token using refresh token.

**Request:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Response:** Same as login response with new tokens.

#### GET `/auth/profile`
Get current authenticated user profile.

**Headers Required:**
```typescript
Authorization: Bearer <access_token>
```

**Response:**
```typescript
interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN';
  profile?: UserProfile;
}
```

#### POST `/auth/logout`
Logout and invalidate tokens on backend.

**Headers Required:**
```typescript
Authorization: Bearer <access_token>
```

**Response:** `204 No Content`

## Request Interceptors

### Automatic Token Attachment
```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token && tokenStorage.isAccessTokenValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Token Refresh on 401
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Auto-logout on refresh failure
        authService.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

## Error Handling Patterns

### Authentication Errors
```typescript
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await this.apiClient.post('/auth/login', credentials);
      // Handle success
    } catch (error: any) {
      // Specific error handling
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || 
          'Account temporarily locked due to too many failed attempts';
        throw new Error(message);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Login failed. Please try again.');
    }
  }
}
```

### Network Error Handling
```typescript
const handleNetworkError = (error: any) => {
  if (error.code === 'ECONNREFUSED') {
    throw new Error('Unable to connect to server. Please try again later.');
  }
  if (error.code === 'TIMEOUT') {
    throw new Error('Request timeout. Please check your connection.');
  }
  
  // Generic fallback
  throw new Error('Network error. Please try again.');
};
```

## Backend Requirements

### Expected API Behavior

#### Authentication Flow
1. **POST `/auth/login`**: Validate admin credentials, return JWT tokens
2. **Token Validation**: All protected endpoints validate JWT and admin role
3. **POST `/auth/refresh`**: Accept refresh token, return new access token
4. **POST `/auth/logout`**: Invalidate refresh token on backend

#### Security Implementation
```typescript
// Backend JWT validation example
const validateAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

#### Account Lockout
```typescript
// Backend brute force protection
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkAccountLockout = async (email) => {
  const attempts = await getFailedAttempts(email);
  
  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    
    if (timeSinceLastAttempt < LOCKOUT_DURATION) {
      throw new Error('Account locked for 15 minutes');
    }
  }
};
```

## Environment Configuration

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.stylenation.com/api
NEXT_PUBLIC_ADMIN_URL=https://admin.stylenation.com
```

## Testing API Integration

### Mock API Setup
```typescript
// Test utilities for API mocking
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockApiClient),
}));
```

### Integration Tests
```typescript
describe('AuthService API Integration', () => {
  it('should handle successful login', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      data: {
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      },
    });

    const user = await authService.login({
      email: 'admin@test.com',
      password: 'password',
    });

    expect(user.role).toBe('ADMIN');
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'password',
    });
  });
});
```

## Performance Considerations

### Request Optimization
- **Connection Pooling**: Reuse HTTP connections
- **Request Batching**: Combine related API calls
- **Caching**: Store non-sensitive response data
- **Timeout Settings**: Appropriate timeouts for UX

### Token Management
- **Proactive Refresh**: Refresh tokens before expiry
- **Background Refresh**: Don't block user interactions
- **Error Recovery**: Graceful handling of refresh failures
- **Storage Optimization**: Minimal client-side storage

This API integration provides robust, secure communication between the admin panel and the backend authentication system while maintaining excellent error handling and user experience.