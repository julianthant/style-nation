import { ApiProperty } from '@nestjs/swagger';
import { CarImage } from '@prisma/client';

export class CarImageEntity implements CarImage {
  constructor(data: CarImage) {
    Object.assign(this, data);
  }

  @ApiProperty({ 
    description: 'Image ID',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Car ID this image belongs to',
    example: '550e8400-e29b-41d4-a716-446655440001' 
  })
  carId: string;

  @ApiProperty({ 
    description: 'Image URL',
    example: 'https://example.supabase.co/storage/v1/object/public/car-images/car1-image1.jpg' 
  })
  url: string;

  @ApiProperty({ 
    description: 'Whether this is the primary image',
    example: true 
  })
  isPrimary: boolean;

  @ApiProperty({ 
    description: 'Display order of the image',
    example: 1 
  })
  order: number;

  @ApiProperty({ 
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z' 
  })
  createdAt: Date;
}