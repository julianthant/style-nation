import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CarPerformanceEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Car ID',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Car make',
  })
  @Expose()
  make: string;

  @ApiProperty({
    example: 'Camry',
    description: 'Car model',
  })
  @Expose()
  model: string;

  @ApiProperty({
    example: 2023,
    description: 'Car year',
  })
  @Expose()
  year: number;

  @ApiProperty({
    example: 28500,
    description: 'Car price in cents',
  })
  @Expose()
  price: number;

  @ApiProperty({
    example: 245,
    description: 'Total number of views',
  })
  @Expose()
  viewCount: number;

  @ApiProperty({
    example: 8,
    description: 'Number of inquiries received',
  })
  @Expose()
  inquiryCount: number;

  @ApiProperty({
    example: 15,
    description: 'Days since car was listed',
  })
  @Expose()
  daysListed: number;

  @ApiProperty({
    example: 'AVAILABLE',
    description: 'Current listing status',
  })
  @Expose()
  status: string;

  @ApiProperty({
    example: true,
    description: 'Whether car is featured',
  })
  @Expose()
  featured: boolean;

  @ApiProperty({
    example: 3.27,
    description: 'Inquiry to view conversion rate percentage',
  })
  @Expose()
  conversionRate: number;

  constructor(data: Partial<CarPerformanceEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class PopularMakeEntity {
  @ApiProperty({
    example: 'Toyota',
    description: 'Car make name',
  })
  @Expose()
  make: string;

  @ApiProperty({
    example: 25,
    description: 'Number of cars of this make',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 1520,
    description: 'Total views for this make',
  })
  @Expose()
  totalViews: number;

  @ApiProperty({
    example: 45,
    description: 'Total inquiries for this make',
  })
  @Expose()
  totalInquiries: number;

  @ApiProperty({
    example: 32500.75,
    description: 'Average price for this make',
  })
  @Expose()
  averagePrice: number;

  constructor(data: Partial<PopularMakeEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class CarMetricsEntity {
  @ApiProperty({
    type: [CarPerformanceEntity],
    description: 'List of car performance data',
  })
  @Expose()
  @Type(() => CarPerformanceEntity)
  cars: CarPerformanceEntity[];

  @ApiProperty({
    type: [PopularMakeEntity],
    description: 'Popular makes statistics',
  })
  @Expose()
  @Type(() => PopularMakeEntity)
  popularMakes: PopularMakeEntity[];

  @ApiProperty({
    example: 2.5,
    description: 'Overall inquiry to view conversion rate percentage',
  })
  @Expose()
  overallConversionRate: number;

  @ApiProperty({
    example: 18.5,
    description: 'Average days cars stay in inventory',
  })
  @Expose()
  averageDaysInInventory: number;

  constructor(data: Partial<CarMetricsEntity>) {
    Object.assign(this, data);

    if (data.cars) {
      this.cars = data.cars.map(car => new CarPerformanceEntity(car));
    }

    if (data.popularMakes) {
      this.popularMakes = data.popularMakes.map(make => new PopularMakeEntity(make));
    }
  }
}