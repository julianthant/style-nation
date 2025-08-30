# Admin Panel Authentication Architecture

## Overview

The Style Nation Admin Panel implements a comprehensive JWT-based authentication system designed specifically for admin-only access. This document outlines the architecture, security measures, and implementation details.

## Architecture Components

### 1. Authentication Service Layer (`src/lib/auth/`)

#### `authService.ts`
- **Purpose**: Core authentication logic and API communication
- **Pattern**: Singleton service with centralized state management
- **Features**:
  - JWT token management (15-minute access tokens, 7-day refresh tokens)
  - Automatic token refresh with request interceptors
  - Account lockout protection (5 failed attempts = 15 minutes lockout)
  - Admin-only role validation
  - Secure logout with backend notification

#### `tokenStorage.ts`
- **Purpose**: Secure token storage and retrieval
- **Storage Strategy**:
  - Access tokens: In-memory (primary) + httpOnly cookies (fallback)
  - Refresh tokens: Secure httpOnly cookies only
  - User data: localStorage with JSON parsing validation
- **Security Features**:
  - Automatic token expiry validation
  - Invalid token cleanup
  - Production-ready secure cookie settings

#### `authContext.tsx`
- **Purpose**: React context for authentication state management
- **Features**:
  - Global authentication state
  - Automatic auth status checking on mount
  - Login/logout handlers with error management
  - Admin role verification
  - Authentication refresh capabilities

#### `types.ts`
- **Purpose**: TypeScript interfaces for type safety
- **Exports**: LoginCredentials, AuthResponse, AuthUser, RefreshTokenRequest, AuthState, AUTH_ENDPOINTS

### 2. Middleware Protection (`src/middleware.ts`)

#### Route Protection Strategy
- **Public Routes**: `/login`, `/unauthorized`, API routes, static assets
- **Protected Routes**: Everything else (admin dashboard, car management, etc.)
- **Authentication Flow**:
  1. Extract JWT from cookies or Authorization header
  2. Validate token format and expiry
  3. Verify admin role requirement
  4. Redirect unauthorized users appropriately

#### Security Features
- Automatic token validation on every request
- Role-based access control (ADMIN only)
- Smart redirect handling with returnTo parameters
- Invalid token cleanup and error handling

### 3. UI Components

#### Login Page (`src/app/login/page.tsx`)
- Form validation with error handling
- Account lockout message display
- Automatic redirect after successful login
- Integration with authentication service

#### Dashboard (`src/app/dashboard/page.tsx`)
- Authentication status display
- Secure logout functionality
- Protected route demonstration

## Security Measures

### 1. Token Security
- **Short-lived access tokens** (15 minutes) to minimize exposure risk
- **Secure refresh tokens** (7 days) stored in httpOnly cookies
- **Automatic token rotation** on each refresh
- **Token invalidation** on logout

### 2. Account Protection
- **Brute force protection** with automatic account lockout
- **Failed login attempt tracking** with backend coordination
- **Secure password handling** (never stored client-side)

### 3. Admin-Only Access
- **Role verification** at multiple layers (service, context, middleware)
- **Backend validation** of admin privileges
- **Automatic logout** for non-admin users

### 4. Request Security
- **Axios interceptors** for automatic token attachment
- **Request/response validation** with error handling
- **CORS configuration** for secure API communication

## Testing Strategy

### 1. Unit Tests (`tests/unit/`)

#### Token Storage Tests (`tokenStorage.test.ts`)
- Token setting/getting operations
- Expiry validation logic
- Storage cleanup functionality
- Edge case handling

#### Auth Service Tests (`authService.test.ts`)
- Login/logout operations
- Token refresh mechanism
- Error handling scenarios
- Admin role validation

#### Middleware Tests (`middleware.test.ts`)
- Route protection logic
- Token validation edge cases
- Redirect behavior
- Public/protected route handling

#### Auth Context Tests (`authContext.test.tsx`)
- React component integration
- State management
- Hook functionality
- Error boundaries

### 2. Test Configuration
- **Jest** with Next.js integration
- **React Testing Library** for component testing
- **Comprehensive mocking** for external dependencies
- **Coverage reporting** with 80% threshold

## Integration Points

### 1. Backend API Integration
- **Endpoint**: `http://localhost:3001/api`
- **Authentication**: Bearer token in Authorization header
- **Endpoints**:
  - `POST /auth/login` - Admin login
  - `POST /auth/refresh` - Token refresh
  - `GET /auth/profile` - Get current user
  - `POST /auth/logout` - Secure logout

### 2. Frontend Route Protection
- **Middleware**: Automatic redirect for unauthenticated users
- **Context**: Global authentication state management
- **Components**: Conditional rendering based on auth status

## Development Guidelines

### 1. Adding New Protected Routes
1. Routes are automatically protected by middleware
2. Use `useAuth()` hook for authentication state
3. Add role checks if different permissions needed

### 2. Handling Authentication Errors
1. Service layer automatically handles 401 responses
2. Token refresh happens transparently
3. User logout occurs on permanent auth failures

### 3. Testing Authentication Features
1. Mock `authService` for component tests
2. Use test utilities for token creation
3. Test both success and failure scenarios

## Security Best Practices

1. **Never store passwords** client-side
2. **Always validate tokens** before API calls
3. **Implement proper logout** to clear all data
4. **Use secure cookie settings** in production
5. **Validate admin role** at multiple layers
6. **Handle token expiry gracefully**
7. **Implement proper error boundaries**

## Production Considerations

1. **Environment Variables**: Ensure proper API URLs and secrets
2. **HTTPS Only**: Force secure connections in production
3. **Cookie Security**: Enable secure, httpOnly, sameSite settings
4. **Error Logging**: Implement proper error tracking
5. **Performance**: Monitor token refresh frequency
6. **Backup Authentication**: Consider fallback mechanisms

This architecture provides a robust, secure foundation for admin authentication while maintaining excellent developer experience and comprehensive test coverage.