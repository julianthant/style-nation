import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../../src/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { TestHelper } from '../../utils/test.helper';
import { TestDataFactory } from '../../utils/test-data.factory';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: TestHelper.createMockPrismaService(),
        },
        {
          provide: JwtService,
          useValue: TestHelper.createMockJwtService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = await TestDataFactory.createUserWithHashedPassword(password);

      prismaService.admin.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateCredentials(email, password);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    });

    it('should return null when user does not exist', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      const result = await service.validateCredentials('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null and increment failed attempts when password is invalid', async () => {
      const user = TestDataFactory.createUser();
      prismaService.admin.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateCredentials('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 1,
          lockedUntil: null,
        },
      });
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      const user = TestDataFactory.createUser({ lockedUntil });
      prismaService.admin.findUnique.mockResolvedValue(user);

      await expect(
        service.validateCredentials('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = TestDataFactory.createUser({ failedLoginAttempts: 4 });
      prismaService.admin.findUnique
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ ...user, failedLoginAttempts: 4 });
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await service.validateCredentials('test@example.com', 'wrongpassword');

      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        },
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = { id: 'user-id', email: 'test@example.com', name: 'Test User', role: 'ADMIN' };
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token' as never);

      const result = await service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' }
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '7d' }
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).toEqual(user);

      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          refreshToken: 'hashed-refresh-token',
          lastLoginAt: expect.any(Date),
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-id', email: 'test@example.com', role: 'ADMIN' };
      const user = TestDataFactory.createUser({ 
        id: payload.sub,
        refreshToken: 'hashed-refresh-token' 
      });

      jwtService.verify.mockReturnValue(payload);
      prismaService.admin.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      mockedBcrypt.hash.mockResolvedValue('new-hashed-refresh-token' as never);

      const result = await service.refreshToken(refreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          refreshToken: 'new-hashed-refresh-token',
        },
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.refreshToken('invalid-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload = { sub: 'nonexistent-user-id' };
      jwtService.verify.mockReturnValue(payload);
      prismaService.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshToken('refresh-token')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when stored refresh token does not match', async () => {
      const payload = { sub: 'user-id' };
      const user = TestDataFactory.createUser({ 
        id: payload.sub,
        refreshToken: 'different-hashed-token' 
      });

      jwtService.verify.mockReturnValue(payload);
      prismaService.admin.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.refreshToken('refresh-token')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      const userId = 'user-id';

      await service.logout(userId);

      expect(prismaService.admin.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshToken: null,
        },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user data when user exists', async () => {
      const userId = 'user-id';
      const user = TestDataFactory.createUser({ id: userId });
      prismaService.admin.findUnique.mockResolvedValue(user);

      const result = await service.validateUser(userId);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    });

    it('should return null when user does not exist', async () => {
      prismaService.admin.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed-password';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.hashPassword(password);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });
});