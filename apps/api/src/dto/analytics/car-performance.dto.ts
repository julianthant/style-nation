import { ApiProperty } from '@nestjs/swagger';

export class CarPerformanceDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Car ID',
  })
  id: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Car make',
  })
  make: string;

  @ApiProperty({
    example: 'Camry',
    description: 'Car model',
  })
  model: string;

  @ApiProperty({
    example: 2023,
    description: 'Car year',
  })
  year: number;

  @ApiProperty({
    example: 28500,
    description: 'Car price in cents',
  })
  price: number;

  @ApiProperty({
    example: 245,
    description: 'Total number of views',
  })
  viewCount: number;

  @ApiProperty({
    example: 8,
    description: 'Number of inquiries received',
  })
  inquiryCount: number;

  @ApiProperty({
    example: 15,
    description: 'Days since car was listed',
  })
  daysListed: number;

  @ApiProperty({
    example: 'AVAILABLE',
    description: 'Current listing status',
  })
  status: string;

  @ApiProperty({
    example: true,
    description: 'Whether car is featured',
  })
  featured: boolean;

  @ApiProperty({
    example: 3.27,
    description: 'Inquiry to view conversion rate percentage',
  })
  conversionRate: number;
}

export class PopularMakeDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Car make name',
  })
  make: string;

  @ApiProperty({
    example: 25,
    description: 'Number of cars of this make',
  })
  count: number;

  @ApiProperty({
    example: 1520,
    description: 'Total views for this make',
  })
  totalViews: number;

  @ApiProperty({
    example: 45,
    description: 'Total inquiries for this make',
  })
  totalInquiries: number;

  @ApiProperty({
    example: 32500.75,
    description: 'Average price for this make',
  })
  averagePrice: number;
}

export class CarMetricsDto {
  @ApiProperty({
    type: [CarPerformanceDto],
    description: 'List of car performance data',
  })
  cars: CarPerformanceDto[];

  @ApiProperty({
    type: [PopularMakeDto],
    description: 'Popular makes statistics',
  })
  popularMakes: PopularMakeDto[];

  @ApiProperty({
    example: 2.5,
    description: 'Overall inquiry to view conversion rate percentage',
  })
  overallConversionRate: number;

  @ApiProperty({
    example: 18.5,
    description: 'Average days cars stay in inventory',
  })
  averageDaysInInventory: number;
}