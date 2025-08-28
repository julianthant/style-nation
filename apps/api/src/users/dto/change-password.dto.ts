import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Current password',
    example: 'currentpassword',
  })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'newpassword',
    minLength: 6,
  })
  newPassword: string;
}