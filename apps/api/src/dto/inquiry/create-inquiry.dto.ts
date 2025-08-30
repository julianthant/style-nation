import { IsString, IsEmail, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID of the car this inquiry is about',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  carId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    description: 'Name of the person making the inquiry',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address of the person making the inquiry',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({
    description: 'Phone number of the person making the inquiry',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  phone?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  @ApiProperty({
    description: 'Inquiry message',
    example: 'I am interested in learning more about this vehicle. Please contact me.',
    minLength: 10,
    maxLength: 1000,
  })
  message: string;
}