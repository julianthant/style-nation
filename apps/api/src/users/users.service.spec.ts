import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      supabaseId: 'supabase-id-123',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    };

    const mockCreatedUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a user successfully', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: createUserDto.email }, { supabaseId: createUserDto.supabaseId } as any],
        },
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          supabaseId: createUserDto.supabaseId,
          email: createUserDto.email,
          role: 'USER',
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          phone: createUserDto.phone,
          avatar: undefined,
        } as any,
      });
    });

    it('should create user without optional fields', async () => {
      const userDtoWithoutOptionalFields: CreateUserDto = {
        email: 'test@example.com',
        supabaseId: 'supabase-id-123',
        role: Role.USER,
      };

      const mockUserWithoutOptionalFields = {
        ...mockCreatedUser,
        firstName: null,
        lastName: null,
        phone: null,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUserWithoutOptionalFields);

      const result = await service.create(userDtoWithoutOptionalFields);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(userDtoWithoutOptionalFields.email);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          supabaseId: userDtoWithoutOptionalFields.supabaseId,
          email: userDtoWithoutOptionalFields.email,
          role: 'USER',
          firstName: undefined,
          lastName: undefined,
          phone: undefined,
          avatar: undefined,
        } as any,
      });
    });

    it('should throw ConflictException when user with email already exists', async () => {
      const existingUser = { ...mockCreatedUser, email: createUserDto.email };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email or Supabase ID already exists')
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user with supabaseId already exists', async () => {
      const existingUser = { ...mockCreatedUser, supabaseId: createUserDto.supabaseId };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('User with this email or Supabase ID already exists')
      );

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          supabaseId: 'supabase-1',
          email: 'user1@example.com',
          role: Role.USER,
          firstName: 'John',
          lastName: 'Doe',
          phone: null,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          supabaseId: 'supabase-2',
          email: 'user2@example.com',
          role: Role.ADMIN,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567890',
          avatar: 'avatar.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[1]).toBeInstanceOf(UserEntity);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    const mockUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find and return user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('user-123');
      expect(result.firstName).toBe('John');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found')
      );
    });
  });

  describe('findByEmail', () => {
    const mockUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find and return user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new NotFoundException('User with email nonexistent@example.com not found')
      );
    });
  });

  describe('findBySupabaseId', () => {
    const mockUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find and return user by supabaseId', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findBySupabaseId('supabase-id-123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.supabaseId).toBe('supabase-id-123');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-id-123' } as any,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findBySupabaseId('nonexistent-supabase-id')).rejects.toThrow(
        new NotFoundException('User with Supabase ID nonexistent-supabase-id not found')
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+9876543210',
    };

    const existingUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser = {
      ...existingUser,
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+9876543210',
    };

    it('should update user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateUserDto)).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found')
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email is already in use', async () => {
      const updateDtoWithEmail = { ...updateUserDto, email: 'existing@example.com' };
      const existingEmailUser = { ...existingUser, email: 'existing@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(existingUser);
      mockPrismaService.user.findUnique.mockResolvedValueOnce(existingEmailUser);

      await expect(service.update('user-123', updateDtoWithEmail)).rejects.toThrow(
        new ConflictException('Email already in use')
      );

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const existingUser = {
      id: 'user-123',
      supabaseId: 'supabase-id-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete user successfully', async () => {
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

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('User with ID non-existent not found')
      );

      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});
