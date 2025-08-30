import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDecimal,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  Max,
  Length,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Condition, Transmission, FuelType, BodyType, ListingStatus } from '@prisma/client';

export class CreateCarDto {
  @ApiProperty({ example: 'Toyota', description: 'Car manufacturer' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  make: string;

  @ApiProperty({ example: 'Camry', description: 'Car model' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  model: string;

  @ApiProperty({ example: 2023, description: 'Year of manufacture', minimum: 1900, maximum: 2030 })
  @IsInt()
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiProperty({ example: '28500.00', description: 'Car price in USD' })
  @Transform(({ value }) => parseFloat(value))
  @IsDecimal({ decimal_digits: '0,2' })
  price: number;

  @ApiProperty({ example: 15000, description: 'Car mileage', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiProperty({ example: '1HGCM82633A123456', description: 'Vehicle Identification Number' })
  @IsString()
  @IsNotEmpty()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin: string;

  @ApiProperty({ 
    enum: Condition, 
    example: Condition.USED, 
    description: 'Car condition' 
  })
  @IsEnum(Condition)
  condition: Condition;

  @ApiProperty({ 
    enum: Transmission, 
    example: Transmission.AUTOMATIC, 
    description: 'Transmission type' 
  })
  @IsEnum(Transmission)
  transmissionType: Transmission;

  @ApiProperty({ 
    enum: FuelType, 
    example: FuelType.GASOLINE, 
    description: 'Fuel type' 
  })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ 
    enum: BodyType, 
    example: BodyType.SEDAN, 
    description: 'Body type' 
  })
  @IsEnum(BodyType)
  bodyType: BodyType;

  @ApiProperty({ example: 'Silver', description: 'Exterior color' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  exteriorColor: string;

  @ApiProperty({ example: 'Black', description: 'Interior color' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  interiorColor: string;

  @ApiProperty({ example: '2.5L', description: 'Engine size', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  engineSize?: string;

  @ApiProperty({ 
    example: ['Bluetooth', 'Backup Camera', 'Apple CarPlay'], 
    description: 'Car features',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  features: string[];

  @ApiProperty({ 
    example: 'Excellent condition Toyota Camry with low mileage. Well-maintained and garage kept.',
    description: 'Car description' 
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  description: string;

  @ApiProperty({ 
    enum: ListingStatus, 
    example: ListingStatus.AVAILABLE, 
    description: 'Listing status',
    required: false 
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus = ListingStatus.AVAILABLE;

  @ApiProperty({ 
    example: '2024-12-31T23:59:59.000Z', 
    description: 'Featured until date (ISO string)',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  featuredUntil?: Date;

  // CreatedBy will be set from the authenticated user in the controller
}