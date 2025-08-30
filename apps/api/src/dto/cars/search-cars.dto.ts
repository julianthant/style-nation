import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsDecimal,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Condition, Transmission, FuelType, BodyType, ListingStatus } from '@prisma/client';

export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  YEAR_ASC = 'year_asc',
  YEAR_DESC = 'year_desc',
  MILEAGE_ASC = 'mileage_asc',
  MILEAGE_DESC = 'mileage_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MAKE_ASC = 'make_asc',
  MAKE_DESC = 'make_desc',
}

export class SearchCarsDto {
  @ApiProperty({ 
    example: 'Toyota Camry', 
    description: 'Search term for make, model, or description',
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    example: 'Toyota', 
    description: 'Filter by car make',
    required: false 
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ 
    example: 'Camry', 
    description: 'Filter by car model',
    required: false 
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ 
    example: 15000, 
    description: 'Minimum price',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  minPrice?: number;

  @ApiProperty({ 
    example: 50000, 
    description: 'Maximum price',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ 
    example: 2020, 
    description: 'Minimum year',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2030)
  minYear?: number;

  @ApiProperty({ 
    example: 2024, 
    description: 'Maximum year',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2030)
  maxYear?: number;

  @ApiProperty({ 
    example: 100000, 
    description: 'Maximum mileage',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMileage?: number;

  @ApiProperty({ 
    enum: Condition, 
    description: 'Filter by condition',
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Condition, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  condition?: Condition[];

  @ApiProperty({ 
    enum: Transmission, 
    description: 'Filter by transmission type',
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Transmission, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  transmission?: Transmission[];

  @ApiProperty({ 
    enum: FuelType, 
    description: 'Filter by fuel type',
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(FuelType, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  fuelType?: FuelType[];

  @ApiProperty({ 
    enum: BodyType, 
    description: 'Filter by body type',
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BodyType, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  bodyType?: BodyType[];

  @ApiProperty({ 
    enum: ListingStatus, 
    description: 'Filter by listing status',
    isArray: true,
    required: false,
    default: [ListingStatus.AVAILABLE]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ListingStatus, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  status?: ListingStatus[] = [ListingStatus.AVAILABLE];

  @ApiProperty({ 
    example: false, 
    description: 'Show only featured cars',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  featured?: boolean;

  @ApiProperty({ 
    enum: SortBy, 
    description: 'Sort order',
    default: SortBy.NEWEST,
    required: false 
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.NEWEST;

  @ApiProperty({ 
    example: 1, 
    description: 'Page number (1-based)',
    default: 1,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    example: 20, 
    description: 'Items per page',
    default: 20,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Computed properties for Prisma queries
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}