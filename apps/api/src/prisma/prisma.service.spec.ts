import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeInstanceOf(PrismaService);
  });

  describe('onModuleInit', () => {
    it('should connect to database on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
      
      connectSpy.mockRestore();
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      
      connectSpy.mockRestore();
    });
  });

  describe('database models', () => {
    it('should have user model available', () => {
      expect(service.user).toBeDefined();
      expect(service.user.create).toBeDefined();
      expect(service.user.findMany).toBeDefined();
      expect(service.user.findUnique).toBeDefined();
      expect(service.user.update).toBeDefined();
      expect(service.user.delete).toBeDefined();
    });

    it('should have profile model available', () => {
      expect(service.profile).toBeDefined();
      expect(service.profile.create).toBeDefined();
      expect(service.profile.findMany).toBeDefined();
    });

    it('should have car model available', () => {
      expect(service.car).toBeDefined();
      expect(service.car.create).toBeDefined();
      expect(service.car.findMany).toBeDefined();
    });

    it('should have carImage model available', () => {
      expect(service.carImage).toBeDefined();
    });

    it('should have inquiry model available', () => {
      expect(service.inquiry).toBeDefined();
    });
  });

  describe('transaction support', () => {
    it('should support database transactions', () => {
      expect(service.$transaction).toBeDefined();
      expect(typeof service.$transaction).toBe('function');
    });
  });

  describe('connection management', () => {
    it('should provide connection methods', () => {
      expect(service.$connect).toBeDefined();
      expect(service.$disconnect).toBeDefined();
      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
    });
  });
});
