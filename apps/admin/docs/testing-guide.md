# Testing Guide

## Testing Strategy Overview

The admin panel authentication system uses a comprehensive testing approach with Jest, React Testing Library, and custom test utilities to ensure reliability and security.

## Test Structure

### Test Organization
```
tests/
├── unit/                    # Unit tests for individual components
│   ├── auth/               # Authentication-specific tests
│   │   ├── authService.test.ts     # Service layer tests
│   │   ├── tokenStorage.test.ts    # Token management tests
│   │   └── authContext.test.tsx    # React context tests
│   └── middleware.test.ts  # Route protection tests
├── integration/            # Integration tests (future)
└── e2e/                   # End-to-end tests (future)
```

## Configuration

### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Test Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))
```

## Unit Testing Patterns

### Token Storage Tests

#### Test Structure
```typescript
describe('TokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear internal state
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
        expect.objectContaining({
          secure: false,
          httpOnly: false,
          sameSite: 'strict',
          expires: 1/24,
        })
      );
    });
  });
});
```

#### Key Testing Areas
- Token storage and retrieval
- Expiry validation
- Storage cleanup
- Error handling for invalid tokens

### Auth Service Tests

#### Service Mocking
```typescript
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));
```

#### Test Scenarios
```typescript
describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.create.mockReturnValue(mockAxiosInstance as any);
    AuthService.resetInstance();
    authService = AuthService.getInstance();
  });

  it('should login successfully with valid credentials', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      },
    });

    const user = await authService.login({
      email: 'admin@test.com',
      password: 'password',
    });

    expect(user.role).toBe('ADMIN');
    expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith('test-access-token');
  });
});
```

### Middleware Tests

#### Request Mocking
```typescript
function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {}
) {
  const url = `http://localhost:3002${pathname}`;
  return {
    nextUrl: { pathname, searchParams: new URLSearchParams() },
    url,
    cookies: {
      get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
    },
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as unknown as NextRequest;
}
```

#### Test Scenarios
```typescript
describe('Middleware', () => {
  it('should redirect unauthenticated users to login', () => {
    const request = createMockRequest('/dashboard');
    
    const result = middleware(request);
    
    const [[redirectUrl]] = mockRedirect.mock.calls;
    expect(redirectUrl.toString()).toBe(
      new URL('/login?returnTo=%2Fdashboard', request.url).toString()
    );
  });
});
```

### React Context Tests

#### Component Testing Setup
```typescript
function TestComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  return (
    <div>
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
```

#### Service Mocking for React Tests
```typescript
jest.mock('@/lib/auth/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    getCurrentUserFromStorage: jest.fn(),
    isAuthenticated: jest.fn(),
    isAdmin: jest.fn(),
    refreshAccessToken: jest.fn(),
  },
}));
```

## Test Utilities

### Token Creation Helpers
```typescript
function createValidToken(payload: any = {}, exp?: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const tokenPayload = {
    sub: 'user-id',
    role: 'ADMIN',
    exp: exp || Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
  const signature = 'signature';
  return `${header}.${payloadBase64}.${signature}`;
}

function createExpiredToken(): string {
  return createValidToken({}, Math.floor(Date.now() / 1000) - 3600);
}
```

### Mock Factories
```typescript
const createMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'user-1',
  email: 'admin@example.com',
  role: 'ADMIN',
  ...overrides,
});

const createMockAuthResponse = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  user: createMockUser(),
  ...overrides,
});
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern="authService.test.ts"

# Run specific test case
npm test -- --testNamePattern="should login successfully"

# Run tests verbosely
npm test -- --verbose
```

### Coverage Reports
```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory with:
- HTML report: `coverage/lcov-report/index.html`
- Summary: Console output with pass/fail status

## Testing Best Practices

### 1. Test Isolation
- Clear mocks between tests with `beforeEach()`
- Reset singleton instances for services
- Clean up side effects like local storage

### 2. Meaningful Test Names
```typescript
// Good
it('should redirect unauthenticated users to login with returnTo parameter')

// Bad
it('should redirect users')
```

### 3. Comprehensive Error Testing
```typescript
it('should handle network errors gracefully', async () => {
  mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));
  
  await expect(authService.login(credentials)).rejects.toThrow(
    'Login failed. Please try again.'
  );
});
```

### 4. Mock Verification
```typescript
it('should call logout on non-admin user', async () => {
  const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();
  
  await expect(authService.login(credentials)).rejects.toThrow();
  expect(logoutSpy).toHaveBeenCalled();
});
```

### 5. Async Testing Patterns
```typescript
// Use waitFor for async state changes
await waitFor(() => {
  expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
});

// Use act for user interactions
await act(async () => {
  fireEvent.click(screen.getByText('Login'));
});
```

## Common Testing Issues

### 1. Async State Management
**Problem**: Tests failing due to async state updates
**Solution**: Use `waitFor` and proper async/await patterns

### 2. Mock Timing
**Problem**: Mocks not being applied correctly
**Solution**: Ensure mocks are set up before imports

### 3. Cleanup Issues
**Problem**: Tests affecting each other
**Solution**: Proper `beforeEach` cleanup and mock clearing

### 4. URL Object Comparisons
**Problem**: Jest unable to compare URL objects
**Solution**: Compare string representations instead

## Future Testing Enhancements

### Integration Tests
- Full authentication flow testing
- API endpoint integration
- Database state verification

### End-to-End Tests
- Complete user workflows
- Browser-based testing with Playwright
- Visual regression testing

### Performance Tests
- Token refresh performance
- Memory leak detection
- Load testing for authentication endpoints

This comprehensive testing strategy ensures the authentication system is reliable, secure, and maintainable while providing excellent developer experience and confidence in the codebase.