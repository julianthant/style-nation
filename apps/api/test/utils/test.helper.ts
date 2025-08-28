import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  user: any;
}

export class TestHelper {
  /**
   * Clean the database in proper order to respect foreign key constraints
   */
  static async cleanDatabase(prisma: PrismaService): Promise<void> {
    try {
      // Delete in order of dependencies (child tables first)
      await prisma.inquiry.deleteMany({});
      await prisma.carImage.deleteMany({});
      await prisma.car.deleteMany({});
      await prisma.profile.deleteMany({});
      await prisma.user.deleteMany({});
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }

  /**
   * Create Supabase JWT token for testing protected endpoints
   * Note: In real app, tokens come from Supabase Auth, not backend login
   */
  static createSupabaseTestToken(
    jwtService: any,
    secret: string,
    payload: {
      email: string;
      userId?: string;
      role?: string;
      [key: string]: any;
    }
  ): string {
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
    
    return jwtService.sign(supabasePayload, { secret });
  }

  /**
   * Create a test user via API
   */
  static async createTestUser(
    app: INestApplication,
    adminToken: string,
    userData: any,
  ) {
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userData)
      .expect(201);

    return response.body;
  }

  /**
   * Register a user via public registration endpoint
   */
  static async registerUser(app: INestApplication, userData: any) {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send(userData)
      .expect(201);

    return response.body;
  }

  /**
   * Setup test users in database
   */
  static async setupTestUsers(prisma: PrismaService) {
    const bcrypt = require('bcrypt');
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            phone: '+1555000100',
          },
        },
      },
      include: { profile: true },
    });

    // Create regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: await bcrypt.hash('user123', 10),
        role: 'USER',
        profile: {
          create: {
            firstName: 'Regular',
            lastName: 'User',
            phone: '+1555000200',
          },
        },
      },
      include: { profile: true },
    });

    return { adminUser, regularUser };
  }

  /**
   * Wait for async operations to complete
   */
  static async waitFor(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create authorization header with Bearer token
   */
  static createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }

  /**
   * Validate API response structure
   */
  static validateUserResponse(user: any) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
    
    // Should not expose password
    expect(user.password).toBeUndefined();
    
    // Validate profile if present
    if (user.profile) {
      expect(user.profile).toHaveProperty('id');
      expect(user.profile).toHaveProperty('userId');
    }
  }

  /**
   * Validate error response structure
   */
  static validateErrorResponse(response: any, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('statusCode', expectedStatus);
  }

  /**
   * Generate unique email for testing
   */
  static generateUniqueEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  /**
   * Create mock Express request for testing guards
   */
  static createMockRequest(user?: any) {
    return {
      user: user || null,
      headers: {
        authorization: user ? 'Bearer mock-token' : undefined,
      },
    };
  }

  /**
   * Create mock Supabase JWT payload for testing
   */
  static createMockSupabasePayload(overrides?: Partial<any>) {
    const basePayload = {
      iss: 'https://test-project.supabase.co/auth/v1',
      sub: 'e841cda5-1428-4e62-9c83-039d393e589b',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000),
      email: 'test@example.com',
      phone: '',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        email: 'test@example.com',
        email_verified: false,
        phone_verified: false,
        sub: 'e841cda5-1428-4e62-9c83-039d393e589b',
      },
      role: 'authenticated',
      aal: 'aal1',
      amr: [
        {
          method: 'password',
          timestamp: Math.floor(Date.now() / 1000),
        },
      ],
      session_id: 'test-session-id',
      is_anonymous: false,
    };

    return { ...basePayload, ...overrides };
  }

  /**
   * Validate Supabase JWT payload structure
   */
  static validateSupabasePayload(payload: any) {
    // Required Supabase JWT fields
    expect(payload).toHaveProperty('iss');
    expect(payload).toHaveProperty('sub');
    expect(payload).toHaveProperty('aud');
    expect(payload).toHaveProperty('exp');
    // Note: iat may not be present in test tokens, making it optional
    expect(payload).toHaveProperty('role');

    // Supabase-specific validations
    expect(payload.iss).toContain('supabase.co/auth/v1');
    expect(payload.aud).toBe('authenticated');
    expect(payload.role).toBe('authenticated');

    // Validate metadata structure if present
    if (payload.app_metadata) {
      expect(payload.app_metadata).toHaveProperty('provider');
      expect(Array.isArray(payload.app_metadata.providers)).toBe(true);
    }

    if (payload.user_metadata) {
      expect(payload.user_metadata).toHaveProperty('sub', payload.sub);
    }

    if (payload.amr) {
      expect(Array.isArray(payload.amr)).toBe(true);
      payload.amr.forEach((auth: any) => {
        expect(auth).toHaveProperty('method');
        expect(auth).toHaveProperty('timestamp');
      });
    }
  }

  /**
   * Create mock request with Supabase authentication
   */
  static createMockSupabaseRequest(userOverrides?: Partial<any>) {
    const supabasePayload = TestHelper.createMockSupabasePayload(userOverrides);
    return {
      user: supabasePayload,
      headers: {
        authorization: 'Bearer mock-supabase-token',
      },
    };
  }

  /**
   * Create mock Express response for testing
   */
  static createMockResponse() {
    return {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  }
}