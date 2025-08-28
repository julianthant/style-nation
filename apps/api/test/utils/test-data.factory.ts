import { Role } from '@prisma/client';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface TestUserWithProfile extends TestUser {
  profile: TestProfile;
}

export class TestDataFactory {
  /**
   * Create a basic test user
   */
  static createUser(overrides?: Partial<TestUser>): TestUser {
    const now = new Date();
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  /**
   * Create an admin test user
   */
  static createAdminUser(overrides?: Partial<TestUser>): TestUser {
    return this.createUser({
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: Role.ADMIN,
      ...overrides,
    });
  }

  /**
   * Create a test profile
   */
  static createProfile(overrides?: Partial<TestProfile>): TestProfile {
    return {
      id: 'test-profile-id',
      userId: 'test-user-id',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: null,
      ...overrides,
    };
  }

  /**
   * Create a user with profile
   */
  static createUserWithProfile(
    userOverrides?: Partial<TestUser>,
    profileOverrides?: Partial<TestProfile>,
  ): TestUserWithProfile {
    const user = this.createUser(userOverrides);
    const profile = this.createProfile({
      userId: user.id,
      ...profileOverrides,
    });

    return {
      ...user,
      profile,
    };
  }

  /**
   * Create multiple test users
   */
  static createUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({
        id: `test-user-${index + 1}`,
        email: `user${index + 1}@example.com`,
      }),
    );
  }

  /**
   * Create test data for authentication tests
   */
  static createAuthTestData() {
    return {
      validCredentials: {
        email: 'admin@stylenation.com',
        password: 'admin123',
      },
      invalidCredentials: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
      newUserData: {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+1555000123',
      },
    };
  }

  /**
   * Create JWT payload for testing
   */
  static createJwtPayload(overrides?: any) {
    return {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: Role.USER,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      ...overrides,
    };
  }

  /**
   * Create mock Prisma user response
   */
  static createPrismaUser(withProfile = true, overrides?: any) {
    const user = {
      id: 'prisma-user-id',
      email: 'prisma@example.com',
      password: '$2b$10$hashed.password.string',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    if (withProfile) {
      return {
        ...user,
        profile: {
          id: 'prisma-profile-id',
          userId: user.id,
          firstName: 'Prisma',
          lastName: 'User',
          phone: '+1555999888',
          avatar: null,
        },
      };
    }

    return { ...user, profile: null };
  }
}