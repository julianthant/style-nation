import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message with timestamp', () => {
      const result = service.getHello();

      expect(result).toHaveProperty('message', 'Style Nation API is running!');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version', '1.0.0');
      
      // Validate timestamp format
      const timestamp = new Date(result.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should return current timestamp', () => {
      const beforeCall = Date.now();
      const result = service.getHello();
      const afterCall = Date.now();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('message', 'API is healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('database', 'connected');
    });

    it('should return current uptime', () => {
      const result = service.getHealth();

      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('should return environment from NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test with test environment
      process.env.NODE_ENV = 'test';
      let result = service.getHealth();
      expect(result.environment).toBe('test');

      // Test with production environment
      process.env.NODE_ENV = 'production';
      result = service.getHealth();
      expect(result.environment).toBe('production');

      // Test with no NODE_ENV set
      delete process.env.NODE_ENV;
      result = service.getHealth();
      expect(result.environment).toBe('development');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should include current timestamp', () => {
      const beforeCall = Date.now();
      const result = service.getHealth();
      const afterCall = Date.now();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });
  });
});