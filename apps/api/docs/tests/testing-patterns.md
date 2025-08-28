# NestJS Testing Patterns & Examples

This document provides specific testing patterns and real examples from the Style Nation API testing implementation.

---

## 🧪 Unit Testing Patterns

### **1. Service Testing with Database Mocking**

#### Pattern Overview
Test business logic in isolation by mocking the PrismaService to control database responses.

#### Implementation Example
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

#### Key Benefits
- **Fast Execution**: No database calls
- **Predictable Results**: Controlled mock responses
- **Error Testing**: Easy error scenario simulation
- **Isolated Logic**: Pure business logic validation

---

### **2. Controller Testing with Guard Mocking**

#### Pattern Overview
Test API endpoints by mocking authentication and authorization guards.

#### Implementation Example
```typescript
describe('UsersController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });
});
```

#### Advanced Guard Mocking
```typescript
// Mock guard that injects user data
const mockJwtAuthGuard = {
  canActivate: jest.fn().mockImplementation((context) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'test-user', role: Role.USER };
    return true;
  }),
};
```

---

### **3. Auto-Mocking with ModuleMocker**

#### Pattern Overview
Use NestJS's auto-mocking capability to automatically mock dependencies.

#### Implementation Example
```typescript
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(new UserEntity({})),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();
  });
});
```

#### When to Use Auto-Mocking
- **Large Dependency Trees**: Many dependencies to mock
- **Simple Mocks**: Basic mock behavior is sufficient
- **Rapid Development**: Quick test setup for new modules

---

### **4. Password Hashing Testing Pattern**

#### Pattern Overview
Test password security by mocking bcrypt functions.

#### Implementation Example
```typescript
import * as bcrypt from 'bcrypt';

// Mock bcrypt module
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('password hashing', () => {
  beforeEach(() => {
    mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  it('should hash password during user creation', async () => {
    await service.create({ email: 'test@test.com', password: 'plain' });
    
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
  });

  it('should verify password during login', async () => {
    await service.validatePassword('plain', 'hashed');
    
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
  });
});
```

---

## 🌐 End-to-End Testing Patterns

### **1. Application Bootstrap Pattern**

#### Pattern Overview
Create a real NestJS application instance for integration testing.

#### Implementation Example
```typescript
describe('Feature (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply production middleware
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    );

    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

### **2. Authentication Flow Testing Pattern**

#### Pattern Overview
Test complete authentication workflows with real JWT tokens.

#### Implementation Example
```typescript
describe('Authentication Flow', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create test user
    await TestHelper.setupTestUsers(prismaService);
    
    // Get real authentication token
    authToken = await TestHelper.getAuthToken(app, {
      email: 'admin@test.com',
      password: 'admin123',
    });
  });

  it('should access protected route with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.password).toBeUndefined();
      });
  });
});
```

---

### **3. Database Testing Pattern**

#### Pattern Overview
Use real database with proper cleanup for integration testing.

#### Implementation Example
```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    // Clean database before each test
    await TestHelper.cleanDatabase(prismaService);
    // Setup fresh test data
    await TestHelper.setupTestUsers(prismaService);
  });

  it('should handle database constraints correctly', async () => {
    // Test unique constraint violation
    const userData = {
      email: 'existing@test.com',
      password: 'password123',
    };

    // First creation should succeed
    await request(app.getHttpServer())
      .post('/users/register')
      .send(userData)
      .expect(201);

    // Duplicate should fail with 409
    await request(app.getHttpServer())
      .post('/users/register')
      .send(userData)
      .expect(409);
  });
});
```

---

## 🔍 Specific Testing Scenarios

### **1. Error Path Testing**

#### ConflictException Testing
```typescript
it('should throw ConflictException for duplicate email', async () => {
  mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

  await expect(service.create(createUserDto)).rejects.toThrow(
    new ConflictException('User with this email already exists')
  );
});
```

#### NotFoundException Testing
```typescript
it('should throw NotFoundException when user not found', async () => {
  mockPrismaService.user.findUnique.mockResolvedValue(null);

  await expect(service.findOne('non-existent')).rejects.toThrow(
    new NotFoundException('User with ID non-existent not found')
  );
});
```

#### UnauthorizedException Testing
```typescript
it('should throw UnauthorizedException for wrong password', async () => {
  mockedBcrypt.compare.mockResolvedValue(false);

  await expect(service.changePassword(id, dto)).rejects.toThrow(
    new UnauthorizedException('Current password is incorrect')
  );
});
```

---

### **2. Security Testing Scenarios**

#### JWT Token Validation
```typescript
describe('JWT Token Security', () => {
  it('should reject malformed JWT tokens', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer not.a.jwt.token')
      .expect(401);
  });

  it('should reject tokens with invalid signatures', () => {
    const invalidToken = validToken.slice(0, -10) + 'tampered';
    
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });
});
```

#### Role-Based Access Control
```typescript
describe('RBAC Testing', () => {
  it('should allow admin access to admin endpoints', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should deny user access to admin endpoints', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

---

### **3. Input Validation Testing**

#### Request Validation
```typescript
describe('Input Validation', () => {
  it('should validate email format', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'invalid-email-format',
        password: 'password123',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/email/i)
          ])
        );
      });
  });

  it('should enforce password minimum length', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'test@example.com',
        password: '123', // Too short
      })
      .expect(400);
  });
});
```

#### Whitelist Validation
```typescript
it('should reject extra fields in request body', () => {
  return request(app.getHttpServer())
    .post('/users/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      extraField: 'should be rejected',
    })
    .expect(400);
});
```

---

## 🛠️ Utility Usage Patterns

### **Test Data Factory Usage**

#### Basic Usage
```typescript
const user = TestDataFactory.createUser({
  email: 'custom@example.com',
  role: Role.ADMIN,
});

const userWithProfile = TestDataFactory.createUserWithProfile();
```

#### Advanced Usage
```typescript
const authTestData = TestDataFactory.createAuthTestData();
const jwtPayload = TestDataFactory.createJwtPayload({ role: 'ADMIN' });
const prismaUser = TestDataFactory.createPrismaUser(true, { role: Role.ADMIN });
```

### **Test Helper Usage**

#### Database Management
```typescript
// Clean database between tests
await TestHelper.cleanDatabase(prismaService);

// Setup authentication users
const users = await TestHelper.setupTestUsers(prismaService);
```

#### Authentication Helpers
```typescript
// Get JWT token for testing
const token = await TestHelper.getAuthToken(app, credentials);

// Login with full response
const authResult = await TestHelper.loginUser(app, credentials);
```

#### Validation Helpers
```typescript
// Validate user response structure
TestHelper.validateUserResponse(response.body);

// Validate error response
TestHelper.validateErrorResponse(response, 404);
```

### **Mock Factory Usage**

#### Service Mocking
```typescript
const mockPrisma = MockFactory.createMockPrismaService();
const mockConfig = MockFactory.createMockConfigService();
const mockUsers = MockFactory.createMockUsersService();
```

#### Guard Mocking
```typescript
const mockJwtGuard = MockFactory.createMockJwtAuthGuard();
const mockRolesGuard = MockFactory.createMockRolesGuard(true, Role.ADMIN);
```

#### Context Mocking
```typescript
const mockContext = MockFactory.createMockExecutionContext(user);
const mockReflector = MockFactory.createMockReflector();
```

---

## 🔄 Testing Lifecycle Patterns

### **Unit Test Lifecycle**

#### Setup Pattern
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let dependency: DependencyService;

  beforeEach(async () => {
    // Create testing module with mocks
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: DependencyService, useValue: mockDependency },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    dependency = module.get<DependencyService>(DependencyService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock call history
  });
});
```

#### Test Organization Pattern
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    describe('when condition', () => {
      it('should behavior', async () => {
        // Arrange
        const input = {};
        const mockResponse = {};
        mockDependency.method.mockResolvedValue(mockResponse);
        
        // Act
        const result = await service.method(input);
        
        // Assert
        expect(result).toEqual(expected);
        expect(mockDependency.method).toHaveBeenCalledWith(input);
      });
    });
  });
});
```

### **E2E Test Lifecycle**

#### Application Setup Pattern
```typescript
describe('Feature (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authTokens: { admin: string; user: string };

  beforeAll(async () => {
    // Create application instance
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply production middleware
    app.useGlobalPipes(new ValidationPipe(productionConfig));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean and setup fresh data
    await TestHelper.cleanDatabase(prismaService);
    const users = await TestHelper.setupTestUsers(prismaService);
    
    authTokens = {
      admin: await TestHelper.getAuthToken(app, adminCredentials),
      user: await TestHelper.getAuthToken(app, userCredentials),
    };
  });

  afterAll(async () => {
    await TestHelper.cleanDatabase(prismaService);
    await app.close();
  });
});
```

---

## 🎯 Specific Module Testing Patterns

### **Authentication Module Testing**

#### Strategy Testing
```typescript
describe('SupabaseStrategy', () => {
  it('should validate JWT payload', async () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });
});
```

#### Guard Testing
```typescript
describe('JwtAuthGuard', () => {
  it('should bypass authentication for public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
```

#### Decorator Testing
```typescript
describe('CurrentUser Decorator', () => {
  it('should extract user from request context', () => {
    const mockUser = { id: 'user-123' };
    const context = createMockExecutionContext(mockUser);
    const result = CurrentUser(undefined, context);
    expect(result).toEqual(mockUser);
  });
});
```

### **User Management Testing**

#### Service Business Logic Testing
```typescript
describe('UsersService.create', () => {
  it('should hash password and create user with profile', async () => {
    // Mock database responses
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue(mockUser);
    mockedBcrypt.hash.mockResolvedValue('hashed-password');

    const result = await service.create(createUserDto);

    // Verify password hashing
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    
    // Verify database call
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: createUserDto.email,
        password: 'hashed-password',
        profile: { create: expect.any(Object) },
      }),
      include: { profile: true },
    });

    // Verify return type
    expect(result).toBeInstanceOf(UserEntity);
  });
});
```

#### Controller Endpoint Testing
```typescript
describe('UsersController.create', () => {
  it('should delegate to service and return result', async () => {
    mockUsersService.create.mockResolvedValue(mockUserEntity);

    const result = await controller.create(createUserDto);

    expect(result).toEqual(mockUserEntity);
    expect(usersService.create).toHaveBeenCalledWith(createUserDto);
  });
});
```

---

## 🔒 Security Testing Patterns

### **SQL Injection Prevention**

#### Pattern Overview
Test that malicious input doesn't compromise database security.

#### Implementation Example
```typescript
describe('Security Testing', () => {
  it('should prevent SQL injection in user queries', () => {
    const maliciousId = "'; DROP TABLE users; --";
    
    return request(app.getHttpServer())
      .get(`/users/${maliciousId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404); // Should safely return 404, not cause database error
  });
});
```

### **Input Sanitization Testing**

#### XSS Prevention Testing
```typescript
it('should handle potentially malicious input safely', () => {
  const userData = {
    email: TestHelper.generateUniqueEmail(),
    password: 'password123',
    firstName: '<script>alert("xss")</script>',
  };

  return request(app.getHttpServer())
    .post('/users/register')
    .send(userData)
    .expect(201)
    .expect((res) => {
      // Should store and return the value as-is (frontend handles escaping)
      expect(res.body.profile.firstName).toBe(userData.firstName);
    });
});
```

### **Authorization Testing Patterns**

#### Role Enforcement
```typescript
describe('Role-Based Access', () => {
  it('should enforce admin-only access', async () => {
    // Test admin access (should succeed)
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Test user access (should fail)
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

#### Resource Access Control
```typescript
it('should allow users to access only their own data', () => {
  return request(app.getHttpServer())
    .get('/users/me')
    .set('Authorization', `Bearer ${userToken}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.email).toBe('user@test.com'); // Should match token user
    });
});
```

---

## 📊 Performance Testing Patterns

### **Response Time Testing**

#### Pattern Overview
Validate API response times meet performance requirements.

#### Implementation Example
```typescript
describe('Performance Testing', () => {
  it('should respond to authentication requests quickly', async () => {
    const startTime = Date.now();
    
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(validCredentials)
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(2000); // Under 2 seconds
  });
});
```

### **Concurrent Request Testing**

#### Pattern Overview
Test application behavior under concurrent load.

#### Implementation Example
```typescript
it('should handle concurrent requests', async () => {
  const requests = Array.from({ length: 5 }, () =>
    request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
  );

  const responses = await Promise.all(requests);
  
  responses.forEach((response) => {
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## 🔧 Advanced Testing Patterns

### **Request-Scoped Testing**

#### Pattern Overview
Test request-scoped providers with proper context isolation.

#### Implementation Example
```typescript
import { ContextIdFactory } from '@nestjs/core';

describe('Request-Scoped Provider', () => {
  it('should handle request-scoped instances', async () => {
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const service = await moduleRef.resolve(RequestScopedService, contextId);
    
    expect(service).toBeDefined();
  });
});
```

### **Transaction Testing**

#### Pattern Overview
Test database transactions and rollback scenarios.

#### Implementation Example
```typescript
describe('Transaction Handling', () => {
  it('should rollback on transaction failure', async () => {
    // Mock transaction failure
    mockPrismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

    await expect(service.complexOperation(data)).rejects.toThrow('Transaction failed');
    
    // Verify no data was persisted
    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
  });
});
```

### **Module Override Pattern**

#### Pattern Overview
Override entire modules for alternative implementations during testing.

#### Implementation Example
```typescript
describe('Module Override Testing', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();
  });
});
```

---

## 📈 Coverage Optimization Patterns

### **Branch Coverage Enhancement**

#### Pattern Overview
Ensure all conditional paths are tested.

#### Implementation Example
```typescript
describe('Conditional Logic Testing', () => {
  it('should handle user with profile', async () => {
    const userWithProfile = { ...mockUser, profile: mockProfile };
    mockPrismaService.user.findUnique.mockResolvedValue(userWithProfile);

    const result = await service.findOne('user-id');
    expect(result.profile).toBeDefined();
  });

  it('should handle user without profile', async () => {
    const userWithoutProfile = { ...mockUser, profile: null };
    mockPrismaService.user.findUnique.mockResolvedValue(userWithoutProfile);

    const result = await service.findOne('user-id');
    expect(result.profile).toBeNull();
  });
});
```

### **Function Coverage Enhancement**

#### Pattern Overview
Test all public methods and their variations.

#### Implementation Example
```typescript
describe('Complete Method Coverage', () => {
  // Test main functionality
  it('should handle normal case', () => { /* ... */ });
  
  // Test edge cases
  it('should handle empty input', () => { /* ... */ });
  it('should handle null input', () => { /* ... */ });
  it('should handle undefined input', () => { /* ... */ });
  
  // Test error cases
  it('should throw when invalid input', () => { /* ... */ });
  it('should handle service errors', () => { /* ... */ });
});
```

---

## 🎉 Pattern Benefits Summary

### **Development Benefits**
- **Fast Feedback**: Unit tests provide immediate validation
- **Reliable Refactoring**: Comprehensive test coverage enables safe code changes
- **Documentation**: Tests serve as executable documentation
- **Debugging**: Clear test failures help identify issues quickly

### **Quality Assurance Benefits**
- **Regression Prevention**: Automated test suite catches breaking changes
- **Security Validation**: Authentication and authorization testing
- **Performance Monitoring**: Response time and load testing
- **Integration Validation**: E2E tests ensure components work together

### **Team Benefits**
- **Consistent Patterns**: Standardized testing approaches across modules
- **Knowledge Sharing**: Testing examples serve as team documentation
- **Code Quality**: Coverage thresholds enforce quality standards
- **Onboarding**: New team members can learn from existing test patterns

The implemented testing patterns provide a solid foundation for maintaining high code quality and rapid feature development while ensuring security and performance standards are met.