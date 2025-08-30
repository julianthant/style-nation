import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const moduleMocker = new ModuleMocker(global);

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: jest.fn(),
    getHealth: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return hello message', () => {
      const expectedResult = {
        message: 'Style Nation API is running!',
        timestamp: expect.any(String),
        version: '1.0.0',
      };

      mockAppService.getHello.mockReturnValue(expectedResult);

      const result = appController.getHello();

      expect(result).toEqual(expectedResult);
      expect(mockAppService.getHello).toHaveBeenCalled();
    });

    it('should delegate to AppService', () => {
      mockAppService.getHello.mockReturnValue({});

      appController.getHello();

      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const expectedHealth = {
        status: 'ok',
        message: 'API is healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: 'test',
        database: 'connected',
      };

      mockAppService.getHealth.mockReturnValue(expectedHealth);

      const result = appController.getHealth();

      expect(result).toEqual(expectedHealth);
      expect(mockAppService.getHealth).toHaveBeenCalled();
    });

    it('should delegate to AppService', () => {
      mockAppService.getHealth.mockReturnValue({});

      appController.getHealth();

      expect(mockAppService.getHealth).toHaveBeenCalledTimes(1);
    });
  });

});
