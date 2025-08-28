import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: user || null,
        }),
      }),
    } as unknown as ExecutionContext;

    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return true when user has required role', () => {
      const user = { role: 'ADMIN' };
      const context = createMockExecutionContext(user);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const user = { role: 'USER' };
      const context = createMockExecutionContext(user);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return true when user has one of multiple required roles', () => {
      const user = { role: 'USER' };
      const context = createMockExecutionContext(user);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER', 'ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when user is not present in request', () => {
      const context = createMockExecutionContext(null);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user role is undefined', () => {
      const user = { id: 'user-123' }; // No role property
      const context = createMockExecutionContext(user);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle multiple roles requirement correctly', () => {
      const user = { role: 'MODERATOR' };
      const context = createMockExecutionContext(user);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MODERATOR']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});