import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '@prisma/client';

/**
 * Profile Entity
 * 
 * Represents a user's profile information in API responses.
 * Uses class-transformer for proper serialization.
 * Follows NestJS best practices for handling related data.
 */
export class ProfileEntity implements Profile {
  constructor(partial: Partial<ProfileEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description: 'Profile unique identifier',
    example: 'clm456def789ghi',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: 'clm123abc456def',
  })
  userId: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User phone number',
    example: '+1-555-0123',
    required: false,
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'Profile creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Profile last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}