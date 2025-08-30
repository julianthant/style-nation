import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { TestHelper } from '../../utils/test.helper';
import { TestDataFactory } from '../../utils/test-data.factory';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await TestHelper.createTestApp();
    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await TestHelper.cleanDatabase(prismaService);
  });

  afterAll(async () => {
    await TestHelper.cleanDatabase(prismaService);
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      await request(app.getHttpServer())
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Login with the created user
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      expect(loginResponse.body.user).toHaveProperty('email', userData.email);
      expect(loginResponse.body.user).toHaveProperty('name', userData.name);
      expect(loginResponse.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      await request(app.getHttpServer())
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should lock account after 5 failed login attempts', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      
      await request(app.getHttpServer())
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: 'wrongpassword',
          })
          .expect(401);
      }

      // 6th attempt should return account locked message
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(429); // Too Many Requests

      expect(response.body.message).toContain('Account locked');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const { token } = await TestHelper.createUserAndGetToken(app, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      // Get the refresh token from login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;

      // Use refresh token to get new tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
      expect(refreshResponse.body.accessToken).not.toBe(token);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should return 400 when refresh token is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('refreshToken');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const { token } = await TestHelper.createUserAndGetToken(app, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('POST /api/auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const { user, token } = await TestHelper.createUserAndGetToken(app, {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(user.email);
      expect(response.body.name).toBe(user.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/profile')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });
});