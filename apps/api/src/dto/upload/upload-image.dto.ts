import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ 
    description: 'Car ID to upload image for',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @IsUUID()
  carId: string;

  @ApiProperty({ 
    description: 'Whether this is the primary image',
    default: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @ApiProperty({ 
    description: 'Display order of the image',
    example: 1,
    minimum: 1,
    maximum: 20,
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  order?: number;
}

export class UpdateImageDto {
  @ApiProperty({ 
    description: 'Whether this is the primary image',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ 
    description: 'Display order of the image',
    minimum: 1,
    maximum: 20,
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  order?: number;
}