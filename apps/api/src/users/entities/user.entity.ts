import { ApiProperty } from '@nestjs/swagger';
import { User, Role } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ProfileEntity } from './profile.entity';

/**
 * User Entity
 * 
 * Represents a user in API responses with proper serialization.
 * Excludes sensitive data (password) and properly handles relations.
 * Follows NestJS best practices for handling relational data.
 */
export class UserEntity implements User {
  constructor({ profile, password, ...data }: Partial<UserEntity>) {
    Object.assign(this, data);

    // Properly handle Profile relation
    if (profile) {
      this.profile = new ProfileEntity(profile);
    } else if (profile === null) {
      this.profile = null;
    }
    
    // Explicitly exclude password (don't assign it)
    // The @Exclude() decorator handles serialization, but for testing
    // we want it completely removed from the entity instance
  }

  @ApiProperty({
    description: 'User unique identifier',
    example: 'clm123abc456def',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER,
  })
  role: Role;

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

  @ApiProperty({
    description: 'User profile information',
    type: ProfileEntity,
    required: false,
    nullable: true,
  })
  profile?: ProfileEntity;
}  