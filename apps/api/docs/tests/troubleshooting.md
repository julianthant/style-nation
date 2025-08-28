# Testing Troubleshooting Guide

This guide helps resolve common testing issues in the Style Nation API testing suite.

---

## 🚨 Common Testing Issues

### **1. Database Connection Issues**

#### Problem: E2E tests failing with database connection errors
```
Error: Can't reach database server at localhost:5432
```

#### Solutions:
1. **Check Database Status**:
   ```bash
   # Verify PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Or check with Docker
   docker ps | grep postgres
   ```

2. **Verify Test Database URL**:
   ```bash
   # Check .env.test file
   cat .env.test | grep DATABASE_URL
   
   # Ensure test database exists
   createdb style_nation_test
   ```

3. **Run Migrations on Test Database**:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/style_nation_test" npx prisma migrate dev
   ```

---

### **2. Authentication Test Failures**

#### Problem: JWT token validation failures in E2E tests
```
Error: 401 Unauthorized - Invalid token
```

#### Solutions:
1. **Check JWT Secret Configuration**:
   ```typescript
   // Verify .env.test has correct JWT_SECRET
   JWT_SECRET=test-jwt-secret-for-testing-only
   ```

2. **Verify Test User Creation**:
   ```typescript
   // Ensure test users are created before token generation
   beforeEach(async () => {
     await TestHelper.cleanDatabase(prismaService);
     testUsers = await TestHelper.setupTestUsers(prismaService);
   });
   ```

3. **Debug Token Generation**:
   ```typescript
   it('debug token generation', async () => {
     const token = await TestHelper.getAuthToken(app, credentials);
     console.log('Generated token:', token);
     
     // Verify token format
     expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
   });
   ```

---

### **3. Mock-Related Issues**

#### Problem: Mock functions not being called or returning unexpected values
```
Error: Expected mock function to have been called, but it was not called
```

#### Solutions:
1. **Check Mock Setup**:
   ```typescript
   // Ensure mocks are properly configured
   beforeEach(() => {
     mockService.method.mockClear();
     mockService.method.mockResolvedValue(expectedValue);
   });
   ```

2. **Verify Mock Calls**:
   ```typescript
   // Debug mock calls
   console.log('Mock calls:', mockService.method.mock.calls);
   expect(mockService.method).toHaveBeenCalledTimes(1);
   expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
   ```

3. **Reset Mocks Between Tests**:
   ```typescript
   afterEach(() => {
     jest.clearAllMocks(); // Clear call history
     jest.resetAllMocks(); // Reset implementation
   });
   ```

---

### **4. Import and Module Resolution Issues**

#### Problem: Cannot resolve module or import errors
```
Error: Cannot find module '../src/users/users.service'
```

#### Solutions:
1. **Check File Paths**:
   ```typescript
   // Verify relative import paths
   import { UsersService } from '../src/users/users.service';
   
   // Use absolute imports if configured
   import { UsersService } from 'src/users/users.service';
   ```

2. **Verify tsconfig.json Configuration**:
   ```json
   {
     "compilerOptions": {
       "baseUrl": "./",
       "paths": {
         "src/*": ["src/*"]
       }
     }
   }
   ```

3. **Check Module Imports in Tests**:
   ```typescript
   // Ensure all dependencies are properly imported
   const module: TestingModule = await Test.createTestingModule({
     controllers: [UsersController],
     providers: [UsersService, PrismaService],
     imports: [PrismaModule], // Don't forget required modules
   }).compile();
   ```

---

### **5. Test Timeout Issues**

#### Problem: Tests timing out, especially E2E tests
```
Error: Timeout - Async callback was not invoked within the 5000 ms timeout
```

#### Solutions:
1. **Increase Test Timeout**:
   ```typescript
   // In individual test
   it('should handle long operation', async () => {
     // Test implementation
   }, 10000); // 10 second timeout

   // Global timeout in jest config
   "testTimeout": 30000
   ```

2. **Optimize Database Operations**:
   ```typescript
   // Use Promise.all for parallel operations
   const [user1, user2] = await Promise.all([
     TestHelper.createTestUser(app, adminToken, userData1),
     TestHelper.createTestUser(app, adminToken, userData2),
   ]);
   ```

3. **Check Async/Await Usage**:
   ```typescript
   // Ensure all async operations are awaited
   beforeEach(async () => {
     await TestHelper.cleanDatabase(prismaService); // Don't forget await
     testUsers = await TestHelper.setupTestUsers(prismaService);
   });
   ```

---

### **6. Coverage Issues**

#### Problem: Tests pass but coverage is below threshold
```
Error: Coverage threshold for functions (80%) not met: 75%
```

#### Solutions:
1. **Identify Uncovered Code**:
   ```bash
   npm run test:cov
   # Open coverage/lcov-report/index.html in browser
   ```

2. **Add Missing Test Cases**:
   ```typescript
   // Test error paths
   it('should handle service errors', async () => {
     mockService.method.mockRejectedValue(new Error('Service error'));
     await expect(controller.method()).rejects.toThrow('Service error');
   });

   // Test edge cases
   it('should handle empty result', async () => {
     mockService.method.mockResolvedValue([]);
     const result = await service.method();
     expect(result).toEqual([]);
   });
   ```

3. **Test Conditional Branches**:
   ```typescript
   // Test both paths of conditional logic
   describe('conditional behavior', () => {
     it('should handle condition true', () => {
       // Test when condition is true
     });

     it('should handle condition false', () => {
       // Test when condition is false
     });
   });
   ```

---

## 🔍 Debugging Techniques

### **1. Test Debugging with Console Logs**

#### Debug Test Data
```typescript
it('should debug test data', async () => {
  console.log('Input:', createUserDto);
  console.log('Mock response:', mockPrismaService.user.create.mock.calls);
  
  const result = await service.create(createUserDto);
  
  console.log('Result:', result);
});
```

#### Debug Mock Calls
```typescript
afterEach(() => {
  if (process.env.DEBUG_TESTS) {
    console.log('Mock calls:', {
      create: mockPrismaService.user.create.mock.calls,
      findUnique: mockPrismaService.user.findUnique.mock.calls,
    });
  }
  jest.clearAllMocks();
});
```

### **2. Focused Testing**

#### Run Single Test File
```bash
npm test -- users.service.spec.ts
```

#### Run Specific Test Case
```bash
npm test -- --testNamePattern="should create user with profile"
```

#### Focus on Test Suite
```typescript
// Use fdescribe or fit for focused testing
fdescribe('UsersService', () => {
  fit('should focus on this test', () => {
    // Only this test will run
  });
});
```

### **3. Mock Debugging**

#### Verify Mock Configuration
```typescript
it('should verify mock setup', () => {
  expect(jest.isMockFunction(mockPrismaService.user.create)).toBe(true);
  expect(mockPrismaService.user.create).toHaveBeenCalledTimes(0);
});
```

#### Debug Mock Return Values
```typescript
beforeEach(() => {
  const returnValue = { id: 'test-id', email: 'test@test.com' };
  mockPrismaService.user.create.mockResolvedValue(returnValue);
  
  if (process.env.DEBUG_TESTS) {
    console.log('Mock will return:', returnValue);
  }
});
```

---

## ⚡ Performance Debugging

### **1. Slow Test Identification**

#### Enable Verbose Output
```bash
npm test -- --verbose
```

#### Profile Test Performance
```typescript
describe('Performance Debugging', () => {
  it('should measure test performance', async () => {
    const startTime = process.hrtime.bigint();
    
    await service.expensiveOperation();
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    console.log(`Operation took ${duration}ms`);
    expect(duration).toBeLessThan(1000);
  });
});
```

### **2. Memory Leak Detection**

#### Monitor Memory Usage
```typescript
describe('Memory Testing', () => {
  afterEach(() => {
    if (process.env.DEBUG_MEMORY) {
      const used = process.memoryUsage();
      console.log('Memory usage:', {
        heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      });
    }
  });
});
```

---

## 🔧 Environment-Specific Issues

### **1. Development vs CI/CD Differences**

#### Problem: Tests pass locally but fail in CI/CD
```
Different behavior in GitHub Actions vs local development
```

#### Solutions:
1. **Environment Consistency**:
   ```bash
   # Use same Node.js version
   node --version
   npm --version
   
   # Check package-lock.json consistency
   npm ci # Instead of npm install
   ```

2. **Database Setup in CI**:
   ```yaml
   # GitHub Actions example
   services:
     postgres:
       image: postgres:14
       env:
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: style_nation_test
   ```

### **2. Windows vs Linux/Mac Issues**

#### Problem: Path or command differences between operating systems
```
Error: spawn UNKNOWN on Windows
```

#### Solutions:
1. **Use Cross-Platform Commands**:
   ```json
   {
     "scripts": {
       "test:clean": "rimraf coverage dist",
       "test:setup": "cross-env NODE_ENV=test npm run prisma:migrate"
     }
   }
   ```

2. **Path Handling**:
   ```typescript
   import path from 'path';
   
   const testFilePath = path.join(__dirname, '..', 'test-file.ts');
   ```

---

## 📋 Debugging Checklist

### **Before Running Tests**
- [ ] Database is running and accessible
- [ ] Environment variables are set correctly
- [ ] Dependencies are installed (`npm ci`)
- [ ] Prisma client is generated (`npm run prisma:generate`)
- [ ] Test database exists and has migrations applied

### **When Tests Fail**
- [ ] Check error message carefully for specific failure
- [ ] Verify mock setup and return values
- [ ] Ensure async operations are properly awaited
- [ ] Check import paths and module dependencies
- [ ] Verify test isolation (clean state between tests)

### **For Coverage Issues**
- [ ] Run coverage report to identify missing areas
- [ ] Add tests for error paths and edge cases
- [ ] Test all conditional branches
- [ ] Ensure all public methods are tested
- [ ] Check that new code has corresponding tests

### **For Performance Issues**
- [ ] Use focused tests (fit/fdescribe) for debugging
- [ ] Add timing measurements to identify slow operations
- [ ] Check for unnecessary database operations
- [ ] Verify proper cleanup in test hooks
- [ ] Consider parallel test execution

---

## 🛠️ Advanced Debugging Tools

### **Jest Debugging Commands**

#### Debug Specific Tests
```bash
# Debug mode with breakpoints
npm run test:debug -- --testNamePattern="specific test name"

# Run tests with detailed output
npm test -- --verbose --no-coverage

# Run tests in band (sequential) for debugging
npm test -- --runInBand
```

#### Coverage Analysis
```bash
# Generate detailed coverage report
npm run test:cov

# View coverage in browser
open coverage/lcov-report/index.html

# Text-only coverage summary
npm test -- --coverage --coverageReporters=text-summary
```

### **Database Debugging**

#### Test Database Inspection
```bash
# Connect to test database
psql postgresql://postgres:password@localhost:5432/style_nation_test

# Check table contents
SELECT * FROM "User";
SELECT * FROM "Profile";
```

#### Prisma Studio for Test Database
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/style_nation_test" npx prisma studio
```

### **Authentication Debugging**

#### Token Inspection
```typescript
import jwt from 'jsonwebtoken';

it('should debug JWT token', async () => {
  const token = await TestHelper.getAuthToken(app, credentials);
  
  // Decode token (without verification for debugging)
  const decoded = jwt.decode(token);
  console.log('Token payload:', decoded);
  
  // Verify token manually
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Verified payload:', verified);
});
```

#### Authentication Flow Debugging
```typescript
it('should debug auth flow', async () => {
  // Test user creation
  const user = await TestHelper.setupTestUsers(prismaService);
  console.log('Created user:', user);
  
  // Test login
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials);
  
  console.log('Login response:', loginResponse.body);
  console.log('Login status:', loginResponse.status);
});
```

---

## 🔄 Test Maintenance

### **Updating Tests for Code Changes**

#### When Modifying Services
1. **Update service mocks** to match new method signatures
2. **Add tests for new methods** or modified behavior
3. **Update test data** to match new entity structures
4. **Verify relationship changes** don't break existing tests

#### When Adding New Endpoints
1. **Add controller unit tests** for new endpoints
2. **Update E2E tests** to cover new workflows
3. **Add authorization tests** if new roles/permissions
4. **Update test utilities** if new data types needed

### **Refactoring Test Code**

#### Extract Common Test Setup
```typescript
// Before: Repeated setup in each test file
beforeEach(async () => {
  // Same setup code repeated...
});

// After: Shared setup utility
import { createTestingModule } from '../test/utils/module.factory';

beforeEach(async () => {
  const { module, mocks } = await createTestingModule();
  // Use shared setup
});
```

#### Consolidate Mock Factories
```typescript
// Create reusable mock configurations
const standardUserMocks = MockFactory.createUserServiceMocks();
const standardAuthMocks = MockFactory.createAuthMocks();
```

---

## 📈 Performance Optimization

### **Test Execution Speed**

#### Parallel Test Execution
```bash
# Run tests in parallel (default)
npm test

# Run tests sequentially for debugging
npm test -- --runInBand
```

#### Selective Test Running
```bash
# Run only changed files (with Git)
npm test -- --onlyChanged

# Run tests matching pattern
npm test -- --testPathPattern=users

# Skip slow tests during development
npm test -- --testPathIgnorePatterns=e2e
```

### **Database Test Optimization**

#### Efficient Database Cleanup
```typescript
// Batch delete operations
static async cleanDatabase(prisma: PrismaService): Promise<void> {
  await Promise.all([
    prisma.inquiry.deleteMany({}),
    prisma.carImage.deleteMany({}),
  ]);
  
  await Promise.all([
    prisma.car.deleteMany({}),
    prisma.profile.deleteMany({}),
  ]);
  
  await prisma.user.deleteMany({});
}
```

#### Test Data Reuse
```typescript
// Reuse test users across tests in same suite
beforeAll(async () => {
  testUsers = await TestHelper.setupTestUsers(prismaService);
});

// Only clean non-user data between tests
beforeEach(async () => {
  await prisma.inquiry.deleteMany({});
  await prisma.car.deleteMany({});
});
```

---

## 🎯 Test Quality Issues

### **Flaky Tests**

#### Problem: Tests sometimes pass, sometimes fail
```
Intermittent failures in E2E tests
```

#### Solutions:
1. **Add Proper Waits**:
   ```typescript
   // Wait for async operations to complete
   await TestHelper.waitFor(100);
   
   // Use proper async/await patterns
   const result = await service.asyncOperation();
   ```

2. **Ensure Test Isolation**:
   ```typescript
   beforeEach(async () => {
     // Clean state before each test
     await TestHelper.cleanDatabase(prismaService);
     // Reset all mocks
     jest.clearAllMocks();
   });
   ```

3. **Handle Race Conditions**:
   ```typescript
   // Use sequential operations where order matters
   const user = await createUser();
   const token = await getTokenForUser(user);
   const response = await makeAuthenticatedRequest(token);
   ```

### **False Positive Tests**

#### Problem: Tests pass but don't actually validate behavior
```
Tests always pass regardless of implementation changes
```

#### Solutions:
1. **Verify Mock Expectations**:
   ```typescript
   it('should call service with correct parameters', async () => {
     await controller.create(createUserDto);
     
     // Verify the service was called correctly
     expect(usersService.create).toHaveBeenCalledWith(createUserDto);
     expect(usersService.create).toHaveBeenCalledTimes(1);
   });
   ```

2. **Test Actual Behavior**:
   ```typescript
   it('should return UserEntity instance', async () => {
     const result = await service.create(createUserDto);
     
     // Test actual result, not just mock return
     expect(result).toBeInstanceOf(UserEntity);
     expect(result.password).toBeUndefined();
   });
   ```

---

## 🆘 Emergency Debugging

### **When All Tests Fail Suddenly**

#### Quick Diagnostic Commands
```bash
# Check Node.js and npm versions
node --version && npm --version

# Verify dependencies
npm ls

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset test database
npm run db:reset
DATABASE_URL="test-url" npm run prisma:migrate
```

#### Environment Reset
```bash
# Copy environment template
cp .env.example .env.test

# Generate new Prisma client
npm run prisma:generate

# Reset test database completely
dropdb style_nation_test && createdb style_nation_test
DATABASE_URL="test-url" npm run prisma:migrate
```

### **When Specific Module Tests Fail**

#### Module-Specific Debugging
```typescript
// Add module-specific debugging
describe('Module Debug', () => {
  it('should verify module configuration', async () => {
    const module = await Test.createTestingModule({
      imports: [YourModule],
    }).compile();

    const controller = module.get(YourController);
    const service = module.get(YourService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    
    console.log('Module providers:', module['_instanceLoader']);
  });
});
```

---

## 📞 Getting Help

### **Documentation Resources**
- **NestJS Testing Docs**: https://docs.nestjs.com/fundamentals/testing
- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Supertest Documentation**: https://github.com/visionmedia/supertest

### **Local Documentation**
- **test/README.md**: General testing guide
- **docs/tests/README.md**: Implementation overview
- **docs/tests/testing-patterns.md**: Pattern examples
- **CLAUDE.md**: Updated with testing best practices

### **Debug Mode Testing**
```bash
# Enable debug mode
DEBUG_TESTS=true npm test

# Enable memory debugging
DEBUG_MEMORY=true npm test

# Run with Node.js debugging
npm run test:debug -- --testNamePattern="your test"
```

Remember: Most testing issues are related to environment setup, mock configuration, or async operation handling. Start with the basics and work systematically through the debugging checklist.