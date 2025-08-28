import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt.auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const createMockExecutionContext = (hasSupabaseAuth = true): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: hasSupabaseAuth ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rlc3QtcHJvamVjdC5zdXBhYmFzZS5jby9hdXRoL3YxIiwic3ViIjoidXNlci1pZCIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.signature' : undefined,
          },
          user: hasSupabaseAuth ? {
            iss: 'https://test-project.supabase.co/auth/v1',
            sub: 'user-id',
            aud: 'authenticated',
            email: 'test@example.com',
            role: 'authenticated',
          } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call super.canActivate for protected routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      // Mock the parent AuthGuard method
      const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      superSpy.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(superSpy).toHaveBeenCalledWith(context);
    });

    it('should return true when public metadata is not set and parent allows', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      
      // Mock the parent AuthGuard method to return true
      const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      superSpy.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when public metadata is not set and parent denies', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      
      // Mock the parent AuthGuard method to return false
      const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      superSpy.mockReturnValue(false);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle Supabase Bearer token format', () => {
      const context = createMockExecutionContext(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      // Mock the parent AuthGuard method to validate Supabase JWT
      const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      superSpy.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(superSpy).toHaveBeenCalledWith(context);
    });

    it('should reject requests without Bearer token', () => {
      const context = createMockExecutionContext(false);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      
      // Mock the parent AuthGuard method to reject missing token
      const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
      superSpy.mockReturnValue(false);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});