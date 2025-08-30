import { ApiProperty } from '@nestjs/swagger';
import { Admin, Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AdminEntity implements Admin {
  constructor(partial: Partial<AdminEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ description: 'Admin unique identifier' })
  id: string;

  @ApiProperty({ description: 'Admin name', required: false })
  name: string | null;

  @ApiProperty({ description: 'Admin email address' })
  email: string;

  @ApiProperty({ description: 'Email verification status' })
  emailVerified: boolean;

  @ApiProperty({ description: 'Admin profile image URL', required: false })
  image: string | null;

  @Exclude()
  password: string;

  @ApiProperty({ enum: Role, description: 'Admin role' })
  role: Role;

  @Exclude()
  failedLoginAttempts: number;

  @Exclude()
  lockedUntil: Date | null;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt: Date | null;

  @Exclude()
  refreshToken: string | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Account last update timestamp' })
  updatedAt: Date;
}