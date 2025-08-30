import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../../src/services/analytics.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DashboardStatsEntity } from '../../src/entities/analytics/dashboard-stats.entity';
import { CarMetricsEntity } from '../../src/entities/analytics/car-metrics.entity';
import { InquiryAnalyticsEntity } from '../../src/entities/analytics/inquiry-metrics.entity';
import { ViewsChartEntity, InquiryChartEntity, SalesChartEntity } from '../../src/entities/analytics/chart-data.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    car: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    inquiry: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardOverview', () => {
    it('should return comprehensive dashboard statistics', async () => {
      // Mock car statistics
      mockPrismaService.car.groupBy.mockResolvedValueOnce([
        { status: 'AVAILABLE', _count: { id: 120 } },
        { status: 'SOLD', _count: { id: 25 } },
        { status: 'RESERVED', _count: { id: 5 } },
      ]);

      // Mock inquiry statistics
      mockPrismaService.inquiry.groupBy.mockResolvedValueOnce([
        { status: 'NEW', _count: { id: 12 } },
        { status: 'CONTACTED', _count: { id: 68 } },
        { status: 'CLOSED', _count: { id: 5 } },
      ]);

      // Mock view statistics
      mockPrismaService.car.aggregate.mockResolvedValueOnce({
        _sum: { viewCount: 15420 },
        _avg: { price: 2850000 }, // Price in cents
      });

      // Mock sold cars data
      mockPrismaService.car.findMany.mockResolvedValueOnce([
        { price: 2500000, createdAt: new Date('2024-01-15') },
        { price: 3000000, createdAt: new Date('2024-01-20') },
      ]);

      // Mock featured cars count
      mockPrismaService.car.count.mockResolvedValueOnce(8);

      // Mock monthly views
      mockPrismaService.car.aggregate.mockResolvedValueOnce({
        _sum: { viewCount: 2840 },
      });

      const result = await service.getDashboardOverview();

      expect(result).toBeInstanceOf(DashboardStatsEntity);
      expect(result.totalCars).toBe(150);
      expect(result.availableCars).toBe(120);
      expect(result.soldCars).toBe(25);
      expect(result.reservedCars).toBe(5);
      expect(result.totalInquiries).toBe(85);
      expect(result.newInquiries).toBe(12);
      expect(result.contactedInquiries).toBe(68);
      expect(result.closedInquiries).toBe(5);
      expect(result.totalViews).toBe(15420);
      expect(result.averagePrice).toBe(28500); // Converted from cents
      expect(result.featuredCars).toBe(8);
    });

    it('should handle empty data gracefully', async () => {
      mockPrismaService.car.groupBy.mockResolvedValueOnce([]);
      mockPrismaService.inquiry.groupBy.mockResolvedValueOnce([]);
      mockPrismaService.car.aggregate.mockResolvedValueOnce({
        _sum: { viewCount: null },
        _avg: { price: null },
      });
      mockPrismaService.car.findMany.mockResolvedValueOnce([]);
      mockPrismaService.car.count.mockResolvedValueOnce(0);
      mockPrismaService.car.aggregate.mockResolvedValueOnce({
        _sum: { viewCount: null },
      });

      const result = await service.getDashboardOverview();

      expect(result).toBeInstanceOf(DashboardStatsEntity);
      expect(result.totalCars).toBe(0);
      expect(result.totalViews).toBe(0);
      expect(result.conversionRate).toBe(0);
      expect(result.averagePrice).toBe(0);
    });
  });

  describe('getCarMetrics', () => {
    it('should return car performance metrics', async () => {
      const mockCars = [
        {
          id: 'car-1',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 2850000,
          viewCount: 245,
          status: 'AVAILABLE',
          featured: true,
          createdAt: new Date('2024-01-01'),
          inquiries: [{ id: 'inq-1', createdAt: new Date() }],
          _count: { inquiries: 8 },
        },
        {
          id: 'car-2',
          make: 'Honda',
          model: 'Accord',
          year: 2023,
          price: 2650000,
          viewCount: 180,
          status: 'AVAILABLE',
          featured: false,
          createdAt: new Date('2024-01-15'),
          inquiries: [{ id: 'inq-2', createdAt: new Date() }],
          _count: { inquiries: 5 },
        },
      ];

      mockPrismaService.car.findMany.mockResolvedValueOnce(mockCars);

      // Mock popular makes
      mockPrismaService.car.groupBy.mockResolvedValueOnce([
        {
          make: 'Toyota',
          _count: { id: 25 },
          _sum: { viewCount: 1520 },
          _avg: { price: 2850000 },
        },
      ]);

      mockPrismaService.inquiry.count.mockResolvedValueOnce(45);

      const result = await service.getCarMetrics({ period: '30d' });

      expect(result).toBeInstanceOf(CarMetricsEntity);
      expect(result.cars).toHaveLength(2);
      expect(result.cars[0].make).toBe('Toyota');
      expect(result.cars[0].conversionRate).toBeCloseTo(3.27, 1); // 8/245 * 100
      expect(result.popularMakes).toHaveLength(1);
      expect(result.popularMakes[0].make).toBe('Toyota');
      expect(result.overallConversionRate).toBeCloseTo(3.06, 1); // 13/425 * 100
    });

    it('should handle empty car list', async () => {
      mockPrismaService.car.findMany.mockResolvedValueOnce([]);
      mockPrismaService.car.groupBy.mockResolvedValueOnce([]);

      const result = await service.getCarMetrics({ period: '30d' });

      expect(result).toBeInstanceOf(CarMetricsEntity);
      expect(result.cars).toHaveLength(0);
      expect(result.popularMakes).toHaveLength(0);
      expect(result.overallConversionRate).toBe(0);
    });
  });

  describe('getInquiryAnalytics', () => {
    it('should return inquiry analytics with trends', async () => {
      // Mock inquiry count
      mockPrismaService.inquiry.count.mockResolvedValueOnce(85);

      // Mock sold cars count for conversion rate
      mockPrismaService.car.count.mockResolvedValueOnce(15);

      // Mock inquiry trends (this would be called multiple times for each day)
      mockPrismaService.inquiry.count
        .mockResolvedValueOnce(12) // Total for day 1
        .mockResolvedValueOnce(8)  // New for day 1
        .mockResolvedValueOnce(3)  // Contacted for day 1
        .mockResolvedValueOnce(1)  // Closed for day 1
        .mockResolvedValueOnce(15) // Total for day 2
        .mockResolvedValueOnce(10) // New for day 2
        .mockResolvedValueOnce(4)  // Contacted for day 2
        .mockResolvedValueOnce(1); // Closed for day 2

      const result = await service.getInquiryAnalytics({ period: '7d' });

      expect(result).toBeInstanceOf(InquiryAnalyticsEntity);
      expect(result.totalInquiries).toBe(85);
      expect(result.conversionRate).toBeCloseTo(17.65, 1); // 15/85 * 100
      expect(result.trends).toBeDefined();
      expect(result.averagePerDay).toBeGreaterThan(0);
    });
  });

  describe('getViewsChart', () => {
    it('should return views chart data', async () => {
      const result = await service.getViewsChart({ period: '7d' });

      expect(result).toBeInstanceOf(ViewsChartEntity);
      expect(result.labels).toBeDefined();
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].label).toBe('Daily Views');
      expect(result.type).toBe('line');
      expect(result.totalViews).toBeGreaterThan(0);
      expect(result.averagePerDay).toBeGreaterThan(0);
      expect(result.peakViews).toBeGreaterThan(0);
    });

    it('should handle custom date range', async () => {
      const result = await service.getViewsChart({
        period: 'custom',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      });

      expect(result).toBeInstanceOf(ViewsChartEntity);
      expect(result.labels).toHaveLength(7); // 7 days
      expect(result.datasets[0].data).toHaveLength(7);
    });
  });

  describe('getInquiryChart', () => {
    it('should return inquiry chart data', async () => {
      // Mock sold cars count for conversion rate
      mockPrismaService.car.count.mockResolvedValueOnce(15);

      // Mock inquiry trends for multiple days
      mockPrismaService.inquiry.count
        .mockResolvedValue(5); // Mock return value for each day

      const result = await service.getInquiryChart({ period: '7d' });

      expect(result).toBeInstanceOf(InquiryChartEntity);
      expect(result.labels).toBeDefined();
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].label).toBe('Daily Inquiries');
      expect(result.type).toBe('line');
      expect(result.totalInquiries).toBeGreaterThan(0);
      expect(result.conversionRate).toBeGreaterThan(0);
    });
  });

  describe('getSalesChart', () => {
    it('should return sales chart data', async () => {
      const mockSoldCars = [
        {
          price: 2500000, // Price in cents
          updatedAt: new Date('2024-01-15'),
        },
        {
          price: 3000000,
          updatedAt: new Date('2024-01-16'),
        },
        {
          price: 2750000,
          updatedAt: new Date('2024-01-17'),
        },
      ];

      mockPrismaService.car.findMany.mockResolvedValueOnce(mockSoldCars);

      const result = await service.getSalesChart({ period: '7d' });

      expect(result).toBeInstanceOf(SalesChartEntity);
      expect(result.labels).toBeDefined();
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].label).toBe('Daily Sales ($)');
      expect(result.type).toBe('line');
      expect(result.totalSales).toBe(82500); // Total in dollars
      expect(result.averagePrice).toBeCloseTo(27500, 0); // Average in dollars
      expect(result.growthPercentage).toBe(15.5);
    });

    it('should handle no sales data', async () => {
      mockPrismaService.car.findMany.mockResolvedValueOnce([]);

      const result = await service.getSalesChart({ period: '7d' });

      expect(result).toBeInstanceOf(SalesChartEntity);
      expect(result.totalSales).toBe(0);
      expect(result.averagePrice).toBe(0);
      expect(result.datasets[0].data.every(value => value === 0)).toBe(true);
    });
  });

  describe('date range handling', () => {
    it('should handle predefined periods correctly', () => {
      const testCases = [
        { period: '7d' as const, expectedDays: 7 },
        { period: '30d' as const, expectedDays: 30 },
        { period: '90d' as const, expectedDays: 90 },
      ];

      testCases.forEach(({ period, expectedDays }) => {
        const result = (service as any).getDateRange({ period });
        const daysDiff = Math.ceil(
          (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        expect(daysDiff).toBeCloseTo(expectedDays, 0);
      });
    });

    it('should handle custom date range', () => {
      const result = (service as any).getDateRange({
        period: 'custom',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.startDate).toEqual(new Date('2024-01-01'));
      expect(result.endDate).toEqual(new Date('2024-01-31'));
    });

    it('should default to 30 days for invalid period', () => {
      const result = (service as any).getDateRange({ period: 'invalid' });
      const daysDiff = Math.ceil(
        (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBeCloseTo(30, 0);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully in getDashboardOverview', async () => {
      mockPrismaService.car.groupBy.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.getDashboardOverview()).rejects.toThrow('Database error');
    });

    it('should handle database errors gracefully in getCarMetrics', async () => {
      mockPrismaService.car.findMany.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.getCarMetrics({ period: '30d' })).rejects.toThrow('Database error');
    });
  });

  describe('calculation methods', () => {
    it('should calculate average days in inventory correctly', async () => {
      const mockCars = [
        { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10 days ago
        { createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }, // 20 days ago
        { createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days ago
      ];

      mockPrismaService.car.findMany.mockResolvedValueOnce(mockCars);

      const result = await (service as any).calculateAverageDaysInInventory();

      expect(result).toBeCloseTo(20, 0); // Average of 10, 20, 30 days
    });

    it('should return 0 for empty inventory', async () => {
      mockPrismaService.car.findMany.mockResolvedValueOnce([]);

      const result = await (service as any).calculateAverageDaysInInventory();

      expect(result).toBe(0);
    });
  });
});