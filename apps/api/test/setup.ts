// Global test setup file
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test timeout for all tests
jest.setTimeout(30000);

// Global test configuration
beforeAll(async () => {
  // Setup global test configuration if needed
});

afterAll(async () => {
  // Global cleanup if needed
});

// Mock external services that shouldn't be called during testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

// Console log suppression for cleaner test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});