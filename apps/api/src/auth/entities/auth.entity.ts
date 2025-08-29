import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserInfo {
  @ApiProperty({ 
    description: 'User unique identifier',
    example: 'clm123abc-def4-5678-90ab-cdef12345678'
  })
  id: string;

  @ApiProperty({ 
    description: 'User email address',
    example: 'admin@stylenation.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'User display name',
    example: 'John Doe',
    required: false
  })
  name?: string;

  @ApiProperty({ 
    description: 'User role',
    enum: Role,
    example: Role.ADMIN
  })
  role: Role;
}

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
    description: 'Authenticated user information',
    type: UserInfo
  })
  user: UserInfo;

  constructor(data: Partial<AuthEntity>) {
    Object.assign(this, data);
  }
}