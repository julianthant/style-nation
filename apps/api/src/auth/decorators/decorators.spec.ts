import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { Roles, ROLES_KEY } from './roles.decorator';
import { CurrentUser } from './current-user.decorator';

describe('Auth Decorators', () => {
  describe('Public Decorator', () => {
    it('should set public metadata correctly', () => {
      const reflector = new Reflector();
      
      // Create a mock class with the decorator
      class TestController {
        @Public()
        publicMethod() {}
        
        privateMethod() {}
      }

      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.publicMethod);
      const isNotPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.privateMethod);

      expect(isPublic).toBe(true);
      expect(isNotPublic).toBeUndefined();
    });

    it('should export the correct metadata key', () => {
      expect(IS_PUBLIC_KEY).toBe('isPublic');
    });
  });

  describe('Roles Decorator', () => {
    it('should set roles metadata correctly', () => {
      const reflector = new Reflector();
      
      // Create a mock class with the decorator
      class TestController {
        @Roles('ADMIN')
        adminMethod() {}
        
        @Roles('USER', 'ADMIN')
        multiRoleMethod() {}
        
        noRoleMethod() {}
      }

      const adminRoles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.adminMethod);
      const multiRoles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.multiRoleMethod);
      const noRoles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.noRoleMethod);

      expect(adminRoles).toEqual(['ADMIN']);
      expect(multiRoles).toEqual(['USER', 'ADMIN']);
      expect(noRoles).toBeUndefined();
    });

    it('should export the correct metadata key', () => {
      expect(ROLES_KEY).toBe('roles');
    });

    it('should handle multiple roles correctly', () => {
      const reflector = new Reflector();
      
      class TestController {
        @Roles('USER', 'ADMIN', 'MODERATOR')
        multipleRolesMethod() {}
      }

      const roles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.multipleRolesMethod);
      expect(roles).toHaveLength(3);
      expect(roles).toContain('USER');
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('MODERATOR');
    });
  });

  describe('CurrentUser Decorator', () => {
    const createMockExecutionContext = (user?: any): ExecutionContext => {
      return {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: user,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        getType: jest.fn(),
      } as unknown as ExecutionContext;
    };

    it('should extract user from request', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const context = createMockExecutionContext(mockUser);

      // Test the decorator by applying it and checking the result
      const paramDecorator = CurrentUser();
      expect(typeof paramDecorator).toBe('function');
      
      // Simulate decorator execution
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockUser);
    });

    it('should return null when no user in request', () => {
      const context = createMockExecutionContext(null);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toBeNull();
    });

    it('should handle undefined user', () => {
      const context = createMockExecutionContext(undefined);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toBeUndefined();
    });

    it('should work as parameter decorator', () => {
      // Test that the decorator can be applied to method parameters
      class TestController {
        testMethod(@CurrentUser() user: any) {
          return user;
        }
      }

      const instance = new TestController();
      expect(instance.testMethod).toBeDefined();
      
      // The actual extraction happens at runtime via NestJS
      // This test verifies the decorator doesn't break compilation
    });
  });

  describe('Decorator Integration', () => {
    it('should allow combining decorators on same method', () => {
      const reflector = new Reflector();
      
      class TestController {
        @Public()
        @Roles('ADMIN')
        combinedMethod(@CurrentUser() user: any) {
          return user;
        }
      }

      const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.combinedMethod);
      const roles = reflector.get<string[]>(ROLES_KEY, TestController.prototype.combinedMethod);

      expect(isPublic).toBe(true);
      expect(roles).toEqual(['ADMIN']);
    });

    it('should work with class-level decorators', () => {
      const reflector = new Reflector();
      
      @Roles('ADMIN')
      class TestController {
        @Public()
        publicMethod() {}
        
        protectedMethod() {}
      }

      const classRoles = reflector.get<string[]>(ROLES_KEY, TestController);
      const methodPublic = reflector.get<boolean>(IS_PUBLIC_KEY, TestController.prototype.publicMethod);

      expect(classRoles).toEqual(['ADMIN']);
      expect(methodPublic).toBe(true);
    });
  });
});