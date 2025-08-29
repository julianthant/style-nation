import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

/**
 * User Entity
 *
 * Represents a user in API responses with proper serialization.
 * Follows NestJS best practices for handling admin user data.
 */
export class UserEntity implements User {
  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty({
    description: 'User unique identifier',
    example: 'clm123abc456def',
  })
  id: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
    required: false,
  })
  name: string | null;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@stylenation.com',
  })
  email: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  image: string | null;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.ADMIN,
  })
  role: Role;

  // Security fields - excluded from API responses
  @Exclude()
  password: string;

  @Exclude()
  failedLoginAttempts: number;

  @Exclude()
  lockedUntil: Date | null;

  @Exclude()
  lastLoginAt: Date | null;

  @Exclude()
  refreshToken: string | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
