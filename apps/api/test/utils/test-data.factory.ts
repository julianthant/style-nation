import { Role, User, Car, ListingStatus, Condition, Transmission, FuelType, BodyType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export class TestDataFactory {
  // User factory methods
  static createUser(overrides?: Partial<User>): User {
    return {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      password: 'hashed-password',
      role: Role.ADMIN,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      refreshToken: null,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides,
    };
  }

  static createAdminUser(overrides?: Partial<User>): User {
    return TestDataFactory.createUser({
      id: 'admin-user-id',
      email: 'admin@stylenation.com',
      name: 'Admin User',
      role: Role.ADMIN,
      ...overrides,
    });
  }

  static async createUserWithHashedPassword(password: string = 'password123', overrides?: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return TestDataFactory.createUser({
      password: hashedPassword,
      ...overrides,
    });
  }

  // Car factory methods
  static createCar(overrides?: Partial<Car>): Car {
    return {
      id: 'test-car-id',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: 25000,
      mileage: 15000,
      vin: 'TEST123456789VIN',
      condition: Condition.USED,
      transmissionType: Transmission.AUTOMATIC,
      fuelType: FuelType.GASOLINE,
      bodyType: BodyType.SEDAN,
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      engineSize: '2.5L',
      features: ['Air Conditioning', 'Power Steering'],
      description: 'Test car description',
      status: ListingStatus.AVAILABLE,
      featuredUntil: null,
      facebookPostId: null,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'test-user-id',
      viewCount: 0,
      ...overrides,
    };
  }

  static createFeaturedCar(overrides?: Partial<Car>): Car {
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);
    
    return TestDataFactory.createCar({
      featuredUntil,
      ...overrides,
    });
  }

  // JWT payload factory
  static createJwtPayload(overrides?: any) {
    return {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: Role.ADMIN,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    };
  }

  // Login DTO factory
  static createLoginDto(overrides?: any) {
    return {
      email: 'test@example.com',
      password: 'password123',
      ...overrides,
    };
  }

  // Create user DTO factory
  static createUserDto(overrides?: any) {
    return {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: Role.ADMIN,
      ...overrides,
    };
  }

  // Create car DTO factory
  static createCarDto(overrides?: any) {
    return {
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      price: 22000,
      mileage: 10000,
      vin: 'NEW123456789VIN',
      condition: Condition.USED,
      transmissionType: Transmission.AUTOMATIC,
      fuelType: FuelType.GASOLINE,
      bodyType: BodyType.SEDAN,
      exteriorColor: 'Blue',
      interiorColor: 'Gray',
      engineSize: '2.0L',
      features: ['Air Conditioning', 'Bluetooth'],
      description: 'New car listing description',
      ...overrides,
    };
  }
}