import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TestHelper } from '../utils/test.helper';
import { TestDataFactory } from '../utils/test-data.factory';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

describe('Analytics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock auth guard for tests
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    testHelper = new TestHelper(prisma);

    // Clean database and create test data
    await testHelper.cleanDatabase();
    
    // Create test admin user
    const admin = await testHelper.createAdmin({
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Test Admin',
    });

    // Get auth token
    authToken = await testHelper.getAuthToken(app, {
      email: 'admin@test.com',
      password: 'admin123',
    });

    // Create test data
    await createTestData(prisma, admin.id);
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
    await app.close();
  });

  describe('/analytics/overview (GET)', () => {
    it('should return dashboard overview statistics', () => {
      return request(app.getHttpServer())
        .get('/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCars');
          expect(res.body).toHaveProperty('availableCars');
          expect(res.body).toHaveProperty('soldCars');
          expect(res.body).toHaveProperty('reservedCars');
          expect(res.body).toHaveProperty('totalInquiries');
          expect(res.body).toHaveProperty('newInquiries');
          expect(res.body).toHaveProperty('contactedInquiries');
          expect(res.body).toHaveProperty('closedInquiries');
          expect(res.body).toHaveProperty('totalViews');
          expect(res.body).toHaveProperty('monthlyViews');
          expect(res.body).toHaveProperty('conversionRate');
          expect(res.body).toHaveProperty('averagePrice');
          expect(res.body).toHaveProperty('featuredCars');
          expect(res.body).toHaveProperty('averageDaysInInventory');
          
          expect(typeof res.body.totalCars).toBe('number');
          expect(typeof res.body.conversionRate).toBe('number');
          expect(typeof res.body.averagePrice).toBe('number');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/analytics/overview')
        .expect(401);
    });
  });

  describe('/analytics/cars/performance (GET)', () => {
    it('should return car performance metrics with default parameters', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cars');
          expect(res.body).toHaveProperty('popularMakes');
          expect(res.body).toHaveProperty('overallConversionRate');
          expect(res.body).toHaveProperty('averageDaysInInventory');
          
          expect(Array.isArray(res.body.cars)).toBe(true);
          expect(Array.isArray(res.body.popularMakes)).toBe(true);
          
          if (res.body.cars.length > 0) {
            expect(res.body.cars[0]).toHaveProperty('id');
            expect(res.body.cars[0]).toHaveProperty('make');
            expect(res.body.cars[0]).toHaveProperty('model');
            expect(res.body.cars[0]).toHaveProperty('year');
            expect(res.body.cars[0]).toHaveProperty('price');
            expect(res.body.cars[0]).toHaveProperty('viewCount');
            expect(res.body.cars[0]).toHaveProperty('inquiryCount');
            expect(res.body.cars[0]).toHaveProperty('daysListed');
            expect(res.body.cars[0]).toHaveProperty('conversionRate');
          }
        });
    });

    it('should accept query parameters', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/performance')
        .query({
          period: '30d',
          limit: 5,
          sortBy: 'views',
          sortOrder: 'DESC',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.cars.length).toBeLessThanOrEqual(5);
        });
    });

    it('should handle custom date range', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/performance')
        .query({
          period: 'custom',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: 10,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should validate query parameters', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/performance')
        .query({
          period: 'invalid-period',
          limit: 'not-a-number',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/analytics/cars/popular (GET)', () => {
    it('should return popular cars', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/popular')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cars');
          expect(res.body).toHaveProperty('popularMakes');
          expect(Array.isArray(res.body.cars)).toBe(true);
          
          if (res.body.popularMakes.length > 0) {
            expect(res.body.popularMakes[0]).toHaveProperty('make');
            expect(res.body.popularMakes[0]).toHaveProperty('count');
            expect(res.body.popularMakes[0]).toHaveProperty('totalViews');
            expect(res.body.popularMakes[0]).toHaveProperty('totalInquiries');
            expect(res.body.popularMakes[0]).toHaveProperty('averagePrice');
          }
        });
    });

    it('should accept limit parameter', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/popular')
        .query({ limit: 3 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.cars.length).toBeLessThanOrEqual(3);
        });
    });
  });

  describe('/analytics/inquiries/trends (GET)', () => {
    it('should return inquiry trend analysis', () => {
      return request(app.getHttpServer())
        .get('/analytics/inquiries/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('trends');
          expect(res.body).toHaveProperty('totalInquiries');
          expect(res.body).toHaveProperty('averagePerDay');
          expect(res.body).toHaveProperty('peakDay');
          expect(res.body).toHaveProperty('peakDate');
          expect(res.body).toHaveProperty('averageResponseTime');
          expect(res.body).toHaveProperty('conversionRate');
          
          expect(Array.isArray(res.body.trends)).toBe(true);
          expect(typeof res.body.totalInquiries).toBe('number');
          expect(typeof res.body.averagePerDay).toBe('number');
          expect(typeof res.body.conversionRate).toBe('number');
          
          if (res.body.trends.length > 0) {
            expect(res.body.trends[0]).toHaveProperty('date');
            expect(res.body.trends[0]).toHaveProperty('count');
            expect(res.body.trends[0]).toHaveProperty('newCount');
            expect(res.body.trends[0]).toHaveProperty('contactedCount');
            expect(res.body.trends[0]).toHaveProperty('closedCount');
          }
        });
    });

    it('should accept period and interval parameters', () => {
      return request(app.getHttpServer())
        .get('/analytics/inquiries/trends')
        .query({
          period: '7d',
          interval: 'day',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/analytics/charts/views (GET)', () => {
    it('should return views chart data', () => {
      return request(app.getHttpServer())
        .get('/analytics/charts/views')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('labels');
          expect(res.body).toHaveProperty('datasets');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('totalViews');
          expect(res.body).toHaveProperty('averagePerDay');
          expect(res.body).toHaveProperty('peakViews');
          
          expect(Array.isArray(res.body.labels)).toBe(true);
          expect(Array.isArray(res.body.datasets)).toBe(true);
          expect(res.body.type).toBe('line');
          expect(typeof res.body.totalViews).toBe('number');
          
          if (res.body.datasets.length > 0) {
            expect(res.body.datasets[0]).toHaveProperty('label');
            expect(res.body.datasets[0]).toHaveProperty('data');
            expect(Array.isArray(res.body.datasets[0].data)).toBe(true);
          }
        });
    });

    it('should accept chart parameters', () => {
      return request(app.getHttpServer())
        .get('/analytics/charts/views')
        .query({
          period: '7d',
          interval: 'day',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/analytics/charts/inquiries (GET)', () => {
    it('should return inquiries chart data', () => {
      return request(app.getHttpServer())
        .get('/analytics/charts/inquiries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('labels');
          expect(res.body).toHaveProperty('datasets');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('totalInquiries');
          expect(res.body).toHaveProperty('averagePerDay');
          expect(res.body).toHaveProperty('conversionRate');
          
          expect(Array.isArray(res.body.labels)).toBe(true);
          expect(Array.isArray(res.body.datasets)).toBe(true);
          expect(res.body.type).toBe('line');
        });
    });
  });

  describe('/analytics/charts/sales (GET)', () => {
    it('should return sales chart data', () => {
      return request(app.getHttpServer())
        .get('/analytics/charts/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('labels');
          expect(res.body).toHaveProperty('datasets');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('totalSales');
          expect(res.body).toHaveProperty('averagePrice');
          expect(res.body).toHaveProperty('growthPercentage');
          
          expect(Array.isArray(res.body.labels)).toBe(true);
          expect(Array.isArray(res.body.datasets)).toBe(true);
          expect(res.body.type).toBe('line');
          expect(typeof res.body.totalSales).toBe('number');
          expect(typeof res.body.averagePrice).toBe('number');
          expect(typeof res.body.growthPercentage).toBe('number');
        });
    });

    it('should handle different time periods', () => {
      const periods = ['7d', '30d', '90d'];
      
      return Promise.all(
        periods.map(period =>
          request(app.getHttpServer())
            .get('/analytics/charts/sales')
            .query({ period })
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
        )
      );
    });
  });

  describe('/analytics/summary (GET)', () => {
    it('should return comprehensive analytics summary', () => {
      return request(app.getHttpServer())
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('overview');
          expect(res.body).toHaveProperty('topCars');
          expect(res.body).toHaveProperty('recentTrends');
          
          expect(Array.isArray(res.body.topCars)).toBe(true);
          expect(res.body.topCars.length).toBeLessThanOrEqual(5);
          
          expect(res.body.recentTrends).toHaveProperty('viewsTrend');
          expect(res.body.recentTrends).toHaveProperty('inquiriesTrend');
          expect(res.body.recentTrends).toHaveProperty('salesTrend');
          
          const validTrends = ['increasing', 'stable', 'decreasing'];
          expect(validTrends).toContain(res.body.recentTrends.viewsTrend);
          expect(validTrends).toContain(res.body.recentTrends.inquiriesTrend);
          expect(validTrends).toContain(res.body.recentTrends.salesTrend);
        });
    });

    it('should accept period parameter', () => {
      return request(app.getHttpServer())
        .get('/analytics/summary')
        .query({ period: '30d' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/performance')
        .query({
          period: 'custom',
          startDate: 'invalid-date',
          endDate: '2024-12-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle invalid enum values', () => {
      return request(app.getHttpServer())
        .get('/analytics/charts/views')
        .query({
          interval: 'invalid-interval',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle negative limit values', () => {
      return request(app.getHttpServer())
        .get('/analytics/cars/popular')
        .query({ limit: -5 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200) // Should use default limit
        .expect((res) => {
          expect(res.body.cars.length).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('Response Format', () => {
    it('should return properly serialized entities', () => {
      return request(app.getHttpServer())
        .get('/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Should not contain internal Prisma fields
          expect(res.body).not.toHaveProperty('_count');
          expect(res.body).not.toHaveProperty('_sum');
          expect(res.body).not.toHaveProperty('_avg');
          
          // All numeric fields should be actual numbers
          Object.keys(res.body).forEach(key => {
            const value = res.body[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
              expect(typeof value).toBe('number');
            }
          });
        });
    });

    it('should return consistent data types across endpoints', async () => {
      const endpoints = [
        '/analytics/overview',
        '/analytics/cars/performance',
        '/analytics/inquiries/trends',
        '/analytics/charts/views',
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toBeDefined();
            expect(typeof res.body).toBe('object');
          });
      }
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time limits', () => {
      const start = Date.now();
      
      return request(app.getHttpServer())
        .get('/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(() => {
          const responseTime = Date.now() - start;
          expect(responseTime).toBeLessThan(5000); // 5 seconds max
        });
    });

    it('should handle concurrent requests', () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get('/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );

      return Promise.all(requests);
    });
  });
});

/**
 * Helper function to create test data for analytics tests
 */
async function createTestData(prisma: PrismaService, adminId: string) {
  // Create test cars with various statuses and features
  const cars = await Promise.all([
    TestDataFactory.createCar({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: 2850000, // $28,500
      status: 'AVAILABLE',
      featured: true,
      viewCount: 245,
      createdBy: adminId,
    }),
    TestDataFactory.createCar({
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      price: 2650000,
      status: 'SOLD',
      featured: false,
      viewCount: 180,
      createdBy: adminId,
    }),
    TestDataFactory.createCar({
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      price: 3500000,
      status: 'RESERVED',
      featured: true,
      viewCount: 320,
      createdBy: adminId,
    }),
    TestDataFactory.createCar({
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      price: 4200000,
      status: 'AVAILABLE',
      featured: false,
      viewCount: 150,
      createdBy: adminId,
    }),
  ]);

  // Create test inquiries
  const inquiries = await Promise.all([
    TestDataFactory.createInquiry({
      carId: cars[0].id,
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Interested in this car',
      status: 'NEW',
    }),
    TestDataFactory.createInquiry({
      carId: cars[0].id,
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Can I schedule a test drive?',
      status: 'CONTACTED',
    }),
    TestDataFactory.createInquiry({
      carId: cars[1].id,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      message: 'What is the final price?',
      status: 'CLOSED',
    }),
  ]);

  return { cars, inquiries };
}