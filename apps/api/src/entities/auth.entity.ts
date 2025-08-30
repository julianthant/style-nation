import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AdminInfo {
  @ApiProperty({ 
    description: 'Admin unique identifier',
    example: 'clm123abc-def4-5678-90ab-cdef12345678'
  })
  id: string;

  @ApiProperty({ 
    description: 'Admin email address',
    example: 'admin@stylenation.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Admin display name',
    example: 'John Doe',
    required: false
  })
  name?: string;

  @ApiProperty({ 
    description: 'Admin role',
    enum: Role,
    example: Role.ADMIN
  })
  role: Role;
}

// Keep UserInfo for backwards compatibility during migration
export const UserInfo = AdminInfo;

export class AuthEntity {
  @ApiProperty({ 
    description: 'JWT access token (expires in 1 hour)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({ 
    description: 'JWT refresh token (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({ 
    description: 'Authenticated admin information',
    type: AdminInfo
  })
  user: AdminInfo; // Keep property name 'user' for JWT compatibility

  constructor(data: Partial<AuthEntity>) {
    Object.assign(this, data);
  }
}