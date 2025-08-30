// Test setup file for Jest
// Using CommonJS syntax since ts-jest handles TypeScript compilation

// Global test timeout (10 seconds)
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Global test utilities
global.console = {
  ...console,
  // Uncomment to silence console output during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Setup global mocks if needed
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});