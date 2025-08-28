import { Role } from '@prisma/client';

export class MockFactory {
  /**
   * Create a mock PrismaService for testing
   */
  static createMockPrismaService() {
    return {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      profile: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      car: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      carImage: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      inquiry: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      // Database connection methods
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
    };
  }

  /**
   * Create a mock JWT Auth Guard
   */
  static createMockJwtAuthGuard(shouldActivate = true) {
    return {
      canActivate: jest.fn().mockImplementation((context) => {
        if (shouldActivate) {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'test-user-id',
            email: 'test@example.com',
            role: Role.USER,
          };
        }
        return shouldActivate;
      }),
    };
  }

  /**
   * Create a mock Roles Guard
   */
  static createMockRolesGuard(shouldActivate = true, userRole = Role.USER) {
    return {
      canActivate: jest.fn().mockImplementation((context) => {
        if (!shouldActivate) return false;
        
        const req = context.switchToHttp().getRequest();
        if (!req.user) {
          req.user = { role: userRole };
        }
        return true;
      }),
    };
  }

  /**
   * Create a mock ConfigService
   */
  static createMockConfigService() {
    return {
      get: jest.fn().mockImplementation((key: string) => {
        const mockConfig = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRES_IN: '7d',
          DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
          NODE_ENV: 'test',
          PORT: '3001',
        };
        return mockConfig[key];
      }),
    };
  }

  /**
   * Create a mock UsersService
   */
  static createMockUsersService() {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      changePassword: jest.fn(),
      remove: jest.fn(),
    };
  }

  /**
   * Create mock execution context for guard testing
   */
  static createMockExecutionContext(user?: any, isPublic = false) {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: user || null,
          headers: {
            authorization: user ? 'Bearer mock-token' : undefined,
          },
        }),
        getResponse: jest.fn().mockReturnValue({}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    return mockContext;
  }

  /**
   * Create mock reflector for decorator testing
   */
  static createMockReflector() {
    return {
      getAllAndOverride: jest.fn(),
      getAllAndMerge: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
    };
  }

  /**
   * Create a complete mock testing module configuration
   */
  static createMockTestingModuleConfig() {
    return {
      prismaService: this.createMockPrismaService(),
      configService: this.createMockConfigService(),
      usersService: this.createMockUsersService(),
      jwtAuthGuard: this.createMockJwtAuthGuard(),
      rolesGuard: this.createMockRolesGuard(),
      reflector: this.createMockReflector(),
    };
  }

  /**
   * Create test request headers with authentication
   */
  static createAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate test UUIDs for consistent testing
   */
  static generateTestUuid(prefix = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}