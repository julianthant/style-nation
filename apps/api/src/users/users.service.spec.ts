import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEntity } from './entities/user.entity';
import { Role } from '@prisma/client';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    const mockCreatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'profile-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        avatar: null,
      },
    };

    beforeEach(() => {
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
    });

    it('should create a user with profile successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined(); // Should be excluded by entity
      expect(result.profile?.firstName).toBe(createUserDto.firstName);
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: 'hashed-password',
          role: createUserDto.role,
          profile: {
            create: {
              firstName: createUserDto.firstName,
              lastName: createUserDto.lastName,
              phone: createUserDto.phone,
            },
          },
        },
        include: { profile: true },
      });
    });

    it('should create user without profile when no profile data provided', async () => {
      const userDtoWithoutProfile = {
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      const userWithoutProfile = {
        ...mockCreatedUser,
        profile: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(userWithoutProfile);

      const result = await service.create(userDtoWithoutProfile);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.profile).toBeNull();
      
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userDtoWithoutProfile.email,
          password: 'hashed-password',
          role: userDtoWithoutProfile.role,
          profile: undefined,
        },
        include: { profile: true },
      });
    });

    it('should throw ConflictException when user with email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockCreatedUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email already exists'),
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of UserEntity instances', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: 'hashed',
          role: Role.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: null,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          password: 'hashed',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            id: 'profile-2',
            userId: 'user-2',
            firstName: 'Admin',
            lastName: 'User',
            phone: null,
            avatar: null,
          },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);
      expect(result[0].password).toBeUndefined();
      expect(result[1].password).toBeUndefined();
      
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'profile-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        avatar: null,
      },
    };

    it('should return UserEntity when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('user-123');
      expect(result.password).toBeUndefined();
      expect(result.profile?.firstName).toBe('John');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: { profile: true },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found'),
      );
    });
  });

  describe('findByEmail', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    };

    it('should return UserEntity when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { profile: true },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new NotFoundException('User with email nonexistent@example.com not found'),
      );
    });
  });

  describe('update', () => {
    const existingUser = {
      id: 'user-123',
      email: 'existing@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'profile-123',
        userId: 'user-123',
        firstName: 'Original',
        lastName: 'Name',
        phone: null,
        avatar: null,
      },
    };

    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'User',
      phone: '+1987654321',
    };

    it('should update user and profile successfully', async () => {
      const updatedUser = {
        ...existingUser,
        email: updateUserDto.email,
        profile: {
          ...existingUser.profile,
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          phone: updateUserDto.phone,
        },
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // First call - check user exists
        .mockResolvedValueOnce(null); // Second call - check email availability

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(updateUserDto.email);
      expect(result.profile?.firstName).toBe(updateUserDto.firstName);
      
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          email: updateUserDto.email,
          profile: {
            upsert: {
              create: {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                phone: updateUserDto.phone,
              },
              update: {
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                phone: updateUserDto.phone,
              },
            },
          },
        },
        include: { profile: true },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateUserDto)).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found'),
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new email already exists', async () => {
      const anotherUser = { id: 'other-user', email: 'updated@example.com' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // User exists check
        .mockResolvedValueOnce(anotherUser); // Email conflict check

      await expect(service.update('user-123', updateUserDto)).rejects.toThrow(
        new ConflictException('Email already in use'),
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should update user without checking email when email unchanged', async () => {
      const updateDto = { firstName: 'NewName' };
      const updatedUser = {
        ...existingUser,
        profile: { ...existingUser.profile, firstName: 'NewName' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      // Should only call findUnique once (existence check, not email conflict check)
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'current123',
      newPassword: 'newpassword456',
    };

    const existingUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-current-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockedBcrypt.hash.mockResolvedValue('hashed-new-password' as never);
    });

    it('should change password successfully when current password is correct', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockPrismaService.user.update.mockResolvedValue(existingUser);

      await service.changePassword('user-123', changePasswordDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        existingUser.password,
      );
      
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashed-new-password' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent', changePasswordDto),
      ).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found'),
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.changePassword('user-123', changePasswordDto),
      ).rejects.toThrow(
        new UnauthorizedException('Current password is incorrect'),
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const existingUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete user successfully when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.delete.mockResolvedValue(existingUser);

      await service.remove('user-123');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found'),
      );

      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});