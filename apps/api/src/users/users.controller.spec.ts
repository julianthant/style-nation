import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ModuleMocker } from 'jest-mock';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserEntity = new UserEntity({
    id: 'user-123',
    supabaseId: 'supabase-user-123',
    email: 'test@example.com',
    role: Role.USER,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySupabaseId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      supabaseId: 'supabase-user-123',
      email: 'test@example.com',
      role: Role.USER,
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUserEntity);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserEntity);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle service errors appropriately', async () => {
      const error = new Error('Service error');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
    });
  });

  describe('register', () => {
    const registerDto: CreateUserDto = {
      supabaseId: 'supabase-new-user',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register a user with USER role regardless of provided role', async () => {
      const dtoWithAdminRole = { ...registerDto, role: Role.ADMIN };
      const expectedServiceCall = { ...dtoWithAdminRole, role: Role.USER };

      mockUsersService.create.mockResolvedValue(mockUserEntity);

      const result = await controller.register(dtoWithAdminRole);

      expect(result).toEqual(mockUserEntity);
      expect(usersService.create).toHaveBeenCalledWith(expectedServiceCall);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers = [mockUserEntity];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('getMe', () => {
    const currentUser = { id: 'user-123', email: 'test@example.com' };

    it('should return current user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserEntity);

      const result = await controller.getMe(currentUser);

      expect(result).toEqual(mockUserEntity);
      expect(usersService.findOne).toHaveBeenCalledWith(currentUser.id);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserEntity);

      const result = await controller.findOne('user-123');

      expect(result).toEqual(mockUserEntity);
      expect(usersService.findOne).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updateMe', () => {
    const currentUser = { id: 'user-123' };
    const updateDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update current user profile', async () => {
      const updatedUser = new UserEntity({
        ...mockUserEntity,
        firstName: 'Updated',
        lastName: 'Name',
      });

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(currentUser, updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(currentUser.id, updateDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      email: 'updated@example.com',
      firstName: 'Updated',
    };

    it('should update user by id', async () => {
      const updatedUser = new UserEntity({
        ...mockUserEntity,
        email: 'updated@example.com',
      });

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-123', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-123');

      expect(usersService.remove).toHaveBeenCalledWith('user-123');
    });

    it('should handle service errors appropriately', async () => {
      const error = new Error('Service error');
      mockUsersService.remove.mockRejectedValue(error);

      await expect(controller.remove('user-123')).rejects.toThrow(error);
    });
  });
});
