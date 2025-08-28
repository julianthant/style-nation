import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestHelper } from './utils/test.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
  });

  beforeEach(async () => {
    // Clean database before each test
    await TestHelper.cleanDatabase(prismaService);
  });

  afterAll(async () => {
    await TestHelper.cleanDatabase(prismaService);
    await app.close();
  });

  describe('Health Check Endpoints', () => {
    describe('/ (GET)', () => {
      it('should return basic API status', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body.message).toBe('Style Nation API is running');
            expect(res.body.status).toBe('ok');
          });
      });
    });

    describe('/health (GET)', () => {
      it('should return detailed health status', () => {
        return request(app.getHttpServer())
          .get('/health')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('info');
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('details');
            expect(res.body.status).toBe('ok');
            expect(res.body.info).toHaveProperty('database');
          });
      });
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include security headers', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          // Check for common security headers (added by helmet)
          expect(res.headers).toHaveProperty('x-frame-options');
          expect(res.headers).toHaveProperty('x-content-type-options');
        });
    });

    it('should handle CORS properly', () => {
      return request(app.getHttpServer())
        .options('/')
        .set('Origin', 'http://localhost:3000')
        .expect((res) => {
          // Should handle OPTIONS request for CORS preflight
          expect([200, 204]).toContain(res.status);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should handle malformed JSON requests', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should validate request body structure', () => {
      return request(app.getHttpServer())
        .post('/users/register')
        .send({
          invalidField: 'should be rejected',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.message)).toBe(true);
        });
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api/docs')
        .expect(301); // Redirect to docs page
    });

    it('should serve OpenAPI JSON schema', () => {
      return request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).toHaveProperty('openapi');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('paths');
        });
    });
  });
});