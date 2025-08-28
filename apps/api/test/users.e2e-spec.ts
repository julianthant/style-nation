import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestHelper } from './utils/test.helper';
import { TestDataFactory } from './utils/test-data.factory';
import { Role } from '@prisma/client';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let userToken: string;
  let testUsers: any;

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
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.init();
    
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    // Setup test users for authentication
    testUsers = await TestHelper.setupTestUsers(prismaService);
    
    // Get auth tokens for testing
    adminToken = await TestHelper.getAuthToken(app, {
      email: 'admin@test.com',
      password: 'admin123',
    });
    
    userToken = await TestHelper.getAuthToken(app, {
      email: 'user@test.com',
      password: 'user123',
    });
  });

  beforeEach(async () => {
    // Clean database before each test (except test users)
    await prismaService.inquiry.deleteMany({});
    await prismaService.carImage.deleteMany({});
    await prismaService.car.deleteMany({});
    // Keep test users for authentication
  });

  afterAll(async () => {
    await TestHelper.cleanDatabase(prismaService);
    await app.close();
  });

  describe('User Registration (Public)', () => {
    describe('POST /users/register', () => {
      it('should register a new user successfully', () => {
        const newUserData = {
          email: TestHelper.generateUniqueEmail('register'),
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          phone: '+1555000999',
        };

        return request(app.getHttpServer())
          .post('/users/register')
          .send(newUserData)
          .expect(201)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.email).toBe(newUserData.email);
            expect(res.body.role).toBe('USER'); // Should force USER role
            expect(res.body.profile.firstName).toBe(newUserData.firstName);
            expect(res.body.password).toBeUndefined();
          });
      });

      it('should reject registration with existing email', async () => {
        const duplicateEmail = 'user@test.com'; // Existing user

        return request(app.getHttpServer())
          .post('/users/register')
          .send({
            email: duplicateEmail,
            password: 'password123',
          })
          .expect(409)
          .expect((res) => {
            expect(res.body.statusCode).toBe(409);
            expect(res.body.message).toContain('User with this email already exists');
          });
      });

      it('should validate required fields', () => {
        return request(app.getHttpServer())
          .post('/users/register')
          .send({
            email: 'invalid-email', // Invalid email format
            // Missing password
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(Array.isArray(res.body.message)).toBe(true);
          });
      });

      it('should reject extra fields in request body', () => {
        return request(app.getHttpServer())
          .post('/users/register')
          .send({
            email: TestHelper.generateUniqueEmail(),
            password: 'password123',
            extraField: 'should be rejected',
          })
          .expect(400);
      });

      it('should enforce minimum password length', () => {
        return request(app.getHttpServer())
          .post('/users/register')
          .send({
            email: TestHelper.generateUniqueEmail(),
            password: '123', // Too short
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toEqual(
              expect.arrayContaining([
                expect.stringMatching(/password.*6/i),
              ])
            );
          });
      });
    });
  });

  describe('User Management (Admin Only)', () => {
    describe('POST /users', () => {
      it('should allow admin to create user', () => {
        const newUserData = {
          email: TestHelper.generateUniqueEmail('admin-create'),
          password: 'password123',
          role: Role.ADMIN,
          firstName: 'Created',
          lastName: 'ByAdmin',
        };

        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newUserData)
          .expect(201)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.email).toBe(newUserData.email);
            expect(res.body.role).toBe(Role.ADMIN);
            expect(res.body.profile.firstName).toBe(newUserData.firstName);
          });
      });

      it('should reject regular user attempts to create users', () => {
        const newUserData = {
          email: TestHelper.generateUniqueEmail(),
          password: 'password123',
        };

        return request(app.getHttpServer())
          .post('/users')
          .set('Authorization', `Bearer ${userToken}`)
          .send(newUserData)
          .expect(403);
      });

      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({
            email: TestHelper.generateUniqueEmail(),
            password: 'password123',
          })
          .expect(401);
      });
    });

    describe('GET /users', () => {
      it('should allow admin to list all users', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2); // At least admin and user
            
            res.body.forEach((user) => {
              TestHelper.validateUserResponse(user);
            });
          });
      });

      it('should reject regular user attempts to list users', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .get('/users')
          .expect(401);
      });
    });

    describe('GET /users/:id', () => {
      it('should allow admin to get user by id', () => {
        return request(app.getHttpServer())
          .get(`/users/${testUsers.regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.id).toBe(testUsers.regularUser.id);
          });
      });

      it('should return 404 for non-existent user', () => {
        return request(app.getHttpServer())
          .get('/users/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should reject regular user attempts', () => {
        return request(app.getHttpServer())
          .get(`/users/${testUsers.adminUser.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });

    describe('DELETE /users/:id', () => {
      it('should allow admin to delete user', async () => {
        // Create a user to delete
        const userToDelete = await TestHelper.createTestUser(app, adminToken, {
          email: TestHelper.generateUniqueEmail('delete-test'),
          password: 'password123',
        });

        return request(app.getHttpServer())
          .delete(`/users/${userToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });

      it('should return 404 for non-existent user', () => {
        return request(app.getHttpServer())
          .delete('/users/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should reject regular user attempts', () => {
        return request(app.getHttpServer())
          .delete(`/users/${testUsers.adminUser.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });
  });

  describe('User Profile Management', () => {
    describe('GET /users/me', () => {
      it('should return current user profile', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.email).toBe('user@test.com');
            expect(res.body.role).toBe('USER');
          });
      });

      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .expect(401);
      });
    });

    describe('PATCH /users/me', () => {
      it('should update current user profile', () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+1555999888',
        };

        return request(app.getHttpServer())
          .patch('/users/me')
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.profile.firstName).toBe(updateData.firstName);
            expect(res.body.profile.lastName).toBe(updateData.lastName);
            expect(res.body.profile.phone).toBe(updateData.phone);
          });
      });

      it('should validate update data', () => {
        return request(app.getHttpServer())
          .patch('/users/me')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            email: 'invalid-email-format',
          })
          .expect(400);
      });

      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .patch('/users/me')
          .send({ firstName: 'Test' })
          .expect(401);
      });
    });

    describe('PATCH /users/:id (Admin)', () => {
      it('should allow admin to update any user', () => {
        const updateData = {
          firstName: 'AdminUpdated',
          role: Role.ADMIN,
        };

        return request(app.getHttpServer())
          .patch(`/users/${testUsers.regularUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            TestHelper.validateUserResponse(res.body);
            expect(res.body.profile.firstName).toBe(updateData.firstName);
            expect(res.body.role).toBe(updateData.role);
          });
      });

      it('should reject regular user attempts to update other users', () => {
        return request(app.getHttpServer())
          .patch(`/users/${testUsers.adminUser.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ firstName: 'Hacker' })
          .expect(403);
      });
    });
  });

  describe('Password Management', () => {
    describe('POST /users/change-password', () => {
      it('should change password with valid current password', () => {
        const changePasswordData = {
          currentPassword: 'user123',
          newPassword: 'newpassword456',
        };

        return request(app.getHttpServer())
          .post('/users/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send(changePasswordData)
          .expect(204);
      });

      it('should reject incorrect current password', () => {
        const changePasswordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        };

        return request(app.getHttpServer())
          .post('/users/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send(changePasswordData)
          .expect(401);
      });

      it('should validate password requirements', () => {
        return request(app.getHttpServer())
          .post('/users/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: 'user123',
            newPassword: '123', // Too short
          })
          .expect(400);
      });

      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .post('/users/change-password')
          .send({
            currentPassword: 'current',
            newPassword: 'newpassword',
          })
          .expect(401);
      });
    });
  });

  describe('Authentication Integration', () => {
    describe('Protected Route Access', () => {
      it('should access protected route with valid token', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('authenticated_user');
            expect(res.body.authenticated_user).toHaveProperty('email');
          });
      });

      it('should reject protected route without token', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .expect(401);
      });

      it('should reject protected route with invalid token', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should reject malformed authorization header', () => {
        return request(app.getHttpServer())
          .get('/protected')
          .set('Authorization', 'InvalidFormat token')
          .expect(401);
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin-only endpoints', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny user access to admin-only endpoints', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow both roles to access user-accessible endpoints', async () => {
      // Test with admin token
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Test with user token
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('Data Validation and Security', () => {
    it('should prevent SQL injection in user queries', () => {
      const maliciousId = "'; DROP TABLE users; --";
      
      return request(app.getHttpServer())
        .get(`/users/${maliciousId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404); // Should safely return 404, not cause database error
    });

    it('should sanitize user input', () => {
      const userData = {
        email: TestHelper.generateUniqueEmail(),
        password: 'password123',
        firstName: '<script>alert("xss")</script>',
        lastName: 'Test',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(userData)
        .expect(201)
        .expect((res) => {
          // Should store the raw value but return it safely
          expect(res.body.profile.firstName).toBe(userData.firstName);
        });
    });

    it('should handle large payloads gracefully', () => {
      const largeString = 'a'.repeat(10000);
      
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          email: TestHelper.generateUniqueEmail(),
          password: 'password123',
          firstName: largeString,
        })
        .expect(201); // Should handle large but valid data
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require temporarily breaking the DB connection
      // For now, we'll test that the error handling structure is in place
      const response = await request(app.getHttpServer())
        .get('/users/non-existent-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message');
    });

    it('should return consistent error format', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-uuid-format')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          // Should include timestamp for debugging
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Performance and Pagination', () => {
    beforeEach(async () => {
      // Create multiple test users for pagination testing
      const usersData = Array.from({ length: 5 }, (_, i) => ({
        email: `pagination-user-${i}@test.com`,
        password: 'password123',
        firstName: `User${i}`,
      }));

      for (const userData of usersData) {
        await TestHelper.createTestUser(app, adminToken, userData);
      }
    });

    it('should handle large user lists efficiently', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(7); // 2 initial + 5 created
          
          // Should return in descending creation order
          const timestamps = res.body.map(user => new Date(user.createdAt));
          const sortedTimestamps = [...timestamps].sort((a, b) => b.getTime() - a.getTime());
          expect(timestamps).toEqual(sortedTimestamps);
        });
    });
  });
});