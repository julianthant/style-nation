import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Admin user email address',
    example: 'admin@stylenation.com',
  })
  email: string;

  @IsEnum(Role)
  @IsOptional()
  @ApiProperty({
    description: 'User role (admin only)',
    enum: Role,
    default: Role.ADMIN,
    required: false,
  })
  role?: Role = Role.ADMIN;
}
