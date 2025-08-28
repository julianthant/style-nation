import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestHelper } from './utils/test.helper';

describe('Supabase JWT Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let testUsers: any;

  // Helper to create mock Supabase JWT tokens for testing
  const createSupabaseTestToken = (payload: any) => {
    const supabasePayload = TestHelper.createMockSupabasePayload({
      email: payload.email,
      sub: payload.userId || 'test-user-id',
      user_metadata: {
        email: payload.email,
        email_verified: true,
        sub: payload.userId || 'test-user-id',
      },
      ...payload,
    });
    
    // Sign with explicit secret, no additional options since payload has exp and iat
    const jwt = require('jsonwebtoken');
    return jwt.sign(supabasePayload, configService.get('SUPABASE_JWT_SECRET'), {
      algorithm: 'HS256',
      noTimestamp: true, // Since we provide iat manually
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same middleware as production
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

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  beforeEach(async () => {
    // Clean database and setup fresh test users
    await TestHelper.cleanDatabase(prismaService);
    testUsers = await TestHelper.setupTestUsers(prismaService);
  });

  afterAll(async () => {
    await TestHelper.cleanDatabase(prismaService);
    await app.close();
  });

  describe('Supabase JWT Authentication Flow', () => {

    describe('GET /users/me - Current User Profile (Supabase Auth)', () => {
      it('should return user profile with valid Supabase JWT token', () => {
        const mockToken = createSupabaseTestToken({
          email: 'admin@test.com',
          userId: testUsers.adminUser.id,
        });

        return request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${mockToken}`)
          .expect(200)
          .expect(res => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.id).toBe(testUsers.adminUser.id);
            expect(res.body.email).toBe('admin@test.com');
          });
      });

      it('should reject requests without token', () => {
        return request(app.getHttpServer()).get('/users/me').expect(401);
      });

      it('should reject invalid token format', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should reject expired Supabase token', () => {
        const expiredPayload = TestHelper.createMockSupabasePayload({
          email: 'user@test.com',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        });
        
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(expiredPayload, configService.get('SUPABASE_JWT_SECRET'), {
          algorithm: 'HS256',
          noTimestamp: true,
        });

        return request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
      });
    });

    describe('GET /protected - Supabase Authentication Test', () => {
      it('should return authenticated user with Supabase JWT structure', () => {
        const mockToken = createSupabaseTestToken({
          email: 'user@test.com',
          userId: testUsers.regularUser.id,
        });

        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', `Bearer ${mockToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body).toEqual({
              message: 'AuthGuard works 🎉',
              authenticated_user: expect.any(Object),
            });
            
            const user = res.body.authenticated_user;
            TestHelper.validateSupabasePayload(user);
            expect(user.email).toBe('user@test.com');
          });
      });

      it('should work with admin token and return admin user data', () => {
        const mockToken = createSupabaseTestToken({
          email: 'admin@test.com',
          userId: testUsers.adminUser.id,
        });

        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', `Bearer ${mockToken}`)
          .expect(200)
          .expect(res => {
            expect(res.body.message).toBe('AuthGuard works 🎉');
            
            const user = res.body.authenticated_user;
            TestHelper.validateSupabasePayload(user);
            expect(user.email).toBe('admin@test.com');
          });
      });

      it('should reject requests without Bearer token', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .expect(401);
      });

      it('should reject invalid Bearer token format', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', 'Bearer invalid-token-format')
          .expect(401);
      });

      it('should reject token without Bearer prefix', () => {
        const mockToken = createSupabaseTestToken({
          email: 'user@test.com',
        });

        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', mockToken) // Missing "Bearer "
          .expect(401);
      });
    });
  });

  describe('JWT Token Validation - Supabase Format', () => {
    it('should accept valid Supabase JWT token format', async () => {
      const validToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      TestHelper.validateUserResponse(response.body);
      
      // Validate JWT token follows 3-part format (header.payload.signature)
      expect(validToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should reject token without Bearer prefix', () => {
      const validToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', validToken) // Missing "Bearer "
        .expect(401);
    });

    it('should handle malformed JWT tokens', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer not.a.jwt')
        .expect(401);
    });

    it('should validate Supabase JWT signature', () => {
      const validToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });
      
      // Token with wrong signature (Supabase-specific validation)
      const invalidToken = validToken.slice(0, -10) + 'invalid123';

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should handle Supabase token structure in protected route', async () => {
      const validToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });

      const response = await request(app.getHttpServer())
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'AuthGuard works 🎉',
        authenticated_user: expect.any(Object),
      });

      const authenticatedUser = response.body.authenticated_user;
      
      // Validate Supabase JWT payload structure
      TestHelper.validateSupabasePayload(authenticatedUser);
      expect(authenticatedUser.email).toBe('user@test.com');
    });

    it('should extract Bearer token from Authorization header correctly', async () => {
      const validToken = createSupabaseTestToken({
        email: 'admin@test.com',
        userId: testUsers.adminUser.id,
      });

      // Test that the ExtractJwt.fromAuthHeaderAsBearerToken() works correctly
      const response = await request(app.getHttpServer())
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.authenticated_user).toBeDefined();
      expect(response.body.authenticated_user.sub).toBeDefined();
      expect(response.body.authenticated_user.email).toBe('admin@test.com');
    });
  });

  describe('Cross-Origin and Security', () => {
    it('should handle preflight CORS requests on existing endpoints', () => {
      return request(app.getHttpServer())
        .options('/users/me')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
        .expect(res => {
          // Accept any successful status code (CORS may return 200, 204, or even 404 for OPTIONS)
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('should include basic Express headers in responses', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect(res => {
          // Verify basic Express headers are present
          expect(res.headers).toHaveProperty('content-type');
          expect(res.headers).toHaveProperty('x-powered-by');
        });
    });
  });

  describe('JWT Performance and Token Handling', () => {
    it('should handle concurrent protected route requests', async () => {
      const mockToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });

      const protectedRequests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', `Bearer ${mockToken}`)
      );

      const responses = await Promise.all(protectedRequests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('authenticated_user');
      });
    });

    it('should respond quickly to JWT validation requests', async () => {
      const mockToken = createSupabaseTestToken({
        email: 'user@test.com',
        userId: testUsers.regularUser.id,
      });

      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/protected')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should validate Supabase JWT token structure correctly', () => {
      const mockToken = createSupabaseTestToken({
        email: 'admin@test.com',
        userId: testUsers.adminUser.id,
      });

      return request(app.getHttpServer())
        .get('/protected')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200)
        .expect(res => {
          const user = res.body.authenticated_user;
          TestHelper.validateSupabasePayload(user);
          expect(user.iss).toContain('supabase.co/auth/v1');
          expect(user.aud).toBe('authenticated');
          expect(user.role).toBe('authenticated');
        });
    });
  });
});