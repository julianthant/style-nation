import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Car, Condition, Transmission, FuelType, BodyType, ListingStatus } from '@prisma/client';
import { CarImageEntity } from './car-image.entity';
import { AdminEntity } from './admin.entity';

export class CarEntity implements Car {
  constructor({ images, creator, ...data }: Partial<CarEntity>) {
    Object.assign(this, data);
    
    // Handle nested relations with proper entity instantiation
    if (images) {
      this.images = images.map(image => new CarImageEntity(image));
    }
    
    if (creator) {
      this.creator = new AdminEntity(creator);
    }

    // Note: inquiries relation handled separately if needed
  }

  @ApiProperty({ 
    description: 'Car ID',
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Car manufacturer',
    example: 'Toyota' 
  })
  make: string;

  @ApiProperty({ 
    description: 'Car model',
    example: 'Camry' 
  })
  model: string;

  @ApiProperty({ 
    description: 'Year of manufacture',
    example: 2023 
  })
  year: number;

  @ApiProperty({ 
    description: 'Car price in USD',
    example: 28500.00,
    type: 'number',
    format: 'decimal' 
  })
  price: any; // Prisma Decimal type

  @ApiProperty({ 
    description: 'Car mileage',
    example: 15000,
    nullable: true 
  })
  mileage: number | null;

  @ApiProperty({ 
    description: 'Vehicle Identification Number',
    example: '1HGCM82633A123456' 
  })
  vin: string;

  @ApiProperty({ 
    enum: Condition,
    description: 'Car condition',
    example: Condition.USED 
  })
  condition: Condition;

  @ApiProperty({ 
    enum: Transmission,
    description: 'Transmission type',
    example: Transmission.AUTOMATIC 
  })
  transmissionType: Transmission;

  @ApiProperty({ 
    enum: FuelType,
    description: 'Fuel type',
    example: FuelType.GASOLINE 
  })
  fuelType: FuelType;

  @ApiProperty({ 
    enum: BodyType,
    description: 'Body type',
    example: BodyType.SEDAN 
  })
  bodyType: BodyType;

  @ApiProperty({ 
    description: 'Exterior color',
    example: 'Silver' 
  })
  exteriorColor: string;

  @ApiProperty({ 
    description: 'Interior color',
    example: 'Black' 
  })
  interiorColor: string;

  @ApiProperty({ 
    description: 'Engine size',
    example: '2.5L',
    nullable: true 
  })
  engineSize: string | null;

  @ApiProperty({ 
    description: 'Car features',
    example: ['Bluetooth', 'Backup Camera', 'Apple CarPlay'],
    type: [String] 
  })
  features: string[];

  @ApiProperty({ 
    description: 'Car description',
    example: 'Excellent condition Toyota Camry with low mileage. Well-maintained and garage kept.' 
  })
  description: string;

  @ApiProperty({ 
    enum: ListingStatus,
    description: 'Listing status',
    example: ListingStatus.AVAILABLE 
  })
  status: ListingStatus;

  @ApiProperty({ 
    description: 'Whether the car is featured',
    example: true 
  })
  featured: boolean;

  @ApiProperty({ 
    description: 'Featured until date',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true 
  })
  featuredUntil: Date | null;

  @ApiProperty({ 
    description: 'Facebook post ID if posted',
    example: '123456789_987654321',
    nullable: true 
  })
  facebookPostId: string | null;

  @ApiProperty({ 
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Last update date',
    example: '2024-01-20T15:45:00.000Z' 
  })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'ID of user who created this listing' 
  })
  createdBy: string;

  @ApiProperty({ 
    description: 'Number of times this car has been viewed',
    example: 45 
  })
  viewCount: number;

  // Relations
  @ApiProperty({ 
    description: 'Car images',
    type: [CarImageEntity] 
  })
  images?: CarImageEntity[];

  @ApiProperty({ 
    description: 'Admin who created this listing',
    type: AdminEntity 
  })
  creator?: AdminEntity;

  // Helper method to get primary image
  get primaryImage(): CarImageEntity | undefined {
    return this.images?.find(img => img.isPrimary) || this.images?.[0];
  }

  // Helper method to check if car is featured
  get isFeatured(): boolean {
    return this.featuredUntil ? new Date() <= new Date(this.featuredUntil) : false;
  }

  // Helper method for formatted price
  get formattedPrice(): string {
    return `$${Number(this.price).toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  }

  // Helper method for car title
  get title(): string {
    return `${this.year} ${this.make} ${this.model}`;
  }
}