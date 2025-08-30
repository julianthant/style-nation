import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export class TestHelper {
  /**
   * Clean database tables in proper order (respecting foreign keys)
   */
  static async cleanDatabase(prisma: PrismaService): Promise<void> {
    // Delete in reverse dependency order
    await prisma.inquiry.deleteMany({});
    await prisma.carImage.deleteMany({});
    await prisma.car.deleteMany({});
    await prisma.admin.deleteMany({});
  }

  /**
   * Create a test application instance
   */
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(TestHelper.createMockPrismaService())
      .compile();

    const app = moduleFixture.createNestApplication();

    // Apply the same configuration as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.setGlobalPrefix('api');

    await app.init();
    return app;
  }

  /**
   * Authenticate and get JWT token
   */
  static async getAuthToken(
    app: INestApplication, 
    credentials: { email: string; password: string }
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);

    return response.body.accessToken;
  }

  /**
   * Create test user and get auth token
   */
  static async createUserAndGetToken(
    app: INestApplication,
    userData: { email: string; password: string; name?: string }
  ): Promise<{ user: any; token: string }> {
    // First register the user
    const createResponse = await request(app.getHttpServer())
      .post('/api/users/register')
      .send(userData)
      .expect(201);

    // Then login to get token
    const token = await TestHelper.getAuthToken(app, {
      email: userData.email,
      password: userData.password,
    });

    return {
      user: createResponse.body,
      token,
    };
  }

  /**
   * Mock Prisma service for unit tests
   */
  static createMockPrismaService() {
    return {
      admin: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any,
      car: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      } as any,
      carImage: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      } as any,
      inquiry: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any,
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      onModuleInit: jest.fn().mockResolvedValue(undefined),
    };
  }

  /**
   * Mock JWT service for unit tests
   */
  static createMockJwtService() {
    return {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 'test-user-id', email: 'test@example.com' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'test-user-id', email: 'test@example.com' }),
    };
  }

  /**
   * Setup request agent with authentication
   */
  static setupAuthenticatedRequest(app: INestApplication, token: string) {
    return request(app.getHttpServer()).set('Authorization', `Bearer ${token}`);
  }

  /**
   * Expect validation error response
   */
  static expectValidationError(response: request.Response, field: string) {
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(field);
  }

  /**
   * Expect not found error
   */
  static expectNotFound(response: request.Response) {
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('not found');
  }

  /**
   * Expect unauthorized error
   */
  static expectUnauthorized(response: request.Response) {
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Unauthorized');
  }

  /**
   * Expect forbidden error
   */
  static expectForbidden(response: request.Response) {
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Forbidden');
  }

  /**
   * Generate random email for testing
   */
  static generateRandomEmail(): string {
    const random = Math.random().toString(36).substring(2, 15);
    return `test-${random}@example.com`;
  }

  /**
   * Wait for specified time (useful for testing time-based features)
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}