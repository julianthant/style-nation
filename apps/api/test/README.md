# Testing Guide for Style Nation API

This directory contains comprehensive tests for the Style Nation NestJS API, following official NestJS testing best practices.

## Test Structure

```
test/
├── README.md                 # This guide
├── setup.ts                  # Global test configuration
├── jest-e2e.json            # E2E test configuration
├── utils/
│   ├── test-data.factory.ts # Test data creation utilities
│   ├── mock.factory.ts      # Mock object factories
│   └── test.helper.ts       # Testing helper functions
├── app.e2e-spec.ts          # Application-level E2E tests
├── auth.e2e-spec.ts         # Authentication flow E2E tests
└── users.e2e-spec.ts        # User management E2E tests
```

## Test Types

### Unit Tests (`*.spec.ts`)
- Located alongside source files in `src/` directory
- Test individual components in isolation
- Mock external dependencies (database, services)
- Fast execution, high coverage

### End-to-End Tests (`*.e2e-spec.ts`)
- Located in `test/` directory
- Test complete request/response flows
- Use real application bootstrap
- Test authentication, authorization, and API contracts

## Running Tests

### Development Commands

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run only unit tests (exclude E2E)
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch

# Run integration tests (alias for E2E)
npm run test:integration

# Debug test execution
npm run test:debug
```

### Coverage Reports

Coverage reports are generated in `coverage/` directory with multiple formats:
- **Terminal**: Text output during test runs
- **HTML**: Open `coverage/lcov-report/index.html` in browser
- **LCOV**: Machine-readable format for CI/CD

### Coverage Thresholds

Tests must meet these minimum coverage requirements:
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Environment Setup

### Environment Variables

Tests use `.env.test` file for configuration:
- Separate test database to avoid data conflicts
- Mock external service credentials
- Test-specific JWT secrets
- Logging level set to error for cleaner output

### Database Setup

For E2E tests that require database access:

1. **Create test database**:
   ```bash
   createdb style_nation_test
   ```

2. **Run migrations**:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/style_nation_test" npx prisma migrate dev
   ```

3. **Run tests**:
   ```bash
   npm run test:e2e
   ```

## Writing New Tests

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '../prisma/prisma.service';

describe('YourService', () => {
  let service: YourService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    yourModel: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Add your test cases here
});
```

### E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestHelper } from './utils/test.helper';

describe('YourFeature (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Setup authentication
    authToken = await TestHelper.getAuthToken(app, {
      email: 'admin@test.com',
      password: 'admin123',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // Add your E2E test cases here
});
```

## Testing Best Practices

### 1. Test Organization
- Group related tests with `describe` blocks
- Use descriptive test names: "should do X when Y"
- Follow AAA pattern: Arrange, Act, Assert

### 2. Data Management
- Use `TestDataFactory` for consistent test data
- Clean database state between tests
- Use unique identifiers to avoid conflicts

### 3. Mocking Strategy
- Mock external services (database, HTTP clients)
- Use real dependencies for integration tests
- Mock authentication guards for unit tests

### 4. Error Testing
- Test both success and error scenarios
- Verify correct HTTP status codes
- Test input validation and edge cases

### 5. Security Testing
- Test authentication and authorization
- Verify sensitive data exclusion
- Test input sanitization

## Test Utilities

### TestDataFactory
Creates consistent test data for users, profiles, and other entities.

```typescript
const user = TestDataFactory.createUser({ role: Role.ADMIN });
const userWithProfile = TestDataFactory.createUserWithProfile();
```

### TestHelper
Provides common testing operations:

```typescript
// Clean database
await TestHelper.cleanDatabase(prismaService);

// Get authentication token
const token = await TestHelper.getAuthToken(app, credentials);

// Validate API responses
TestHelper.validateUserResponse(response.body);
```

### MockFactory
Creates mock objects for testing:

```typescript
const mockPrisma = MockFactory.createMockPrismaService();
const mockGuard = MockFactory.createMockJwtAuthGuard();
```

## Debugging Tests

### Common Issues

1. **Database Connection Errors**: Ensure test database is running and accessible
2. **Authentication Failures**: Check JWT secret configuration in `.env.test`
3. **Import Errors**: Verify module imports and provider setup
4. **Async Test Issues**: Use `async/await` or return promises from test functions

### Debug Commands

```bash
# Run single test file
npm test -- users.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Debug specific test
npm run test:debug -- --testNamePattern="your test name"

# Verbose output
npm test -- --verbose

# Run tests without coverage
npm test -- --coverage=false
```

### Test Debugging Tips

1. Use `console.log` in tests for debugging (removed in setup.ts)
2. Use `fit` or `fdescribe` to focus on specific tests
3. Use `xit` or `xdescribe` to skip tests temporarily
4. Check Jest documentation for advanced debugging options

## Continuous Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  run: |
    npm run test
    npm run test:e2e

- name: Check Coverage
  run: npm run test:cov

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Coverage Requirements

All pull requests must maintain or improve test coverage:
- New features require corresponding tests
- Bug fixes should include regression tests
- Refactoring should not decrease coverage

## Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)