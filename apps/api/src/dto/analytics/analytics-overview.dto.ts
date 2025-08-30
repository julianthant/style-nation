import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsOverviewDto {
  @ApiProperty({
    example: 150,
    description: 'Total number of cars in inventory',
  })
  totalCars: number;

  @ApiProperty({
    example: 120,
    description: 'Number of available cars',
  })
  availableCars: number;

  @ApiProperty({
    example: 25,
    description: 'Number of sold cars',
  })
  soldCars: number;

  @ApiProperty({
    example: 5,
    description: 'Number of reserved cars',
  })
  reservedCars: number;

  @ApiProperty({
    example: 85,
    description: 'Total customer inquiries received',
  })
  totalInquiries: number;

  @ApiProperty({
    example: 12,
    description: 'New inquiries (not yet contacted)',
  })
  newInquiries: number;

  @ApiProperty({
    example: 68,
    description: 'Inquiries that have been contacted',
  })
  contactedInquiries: number;

  @ApiProperty({
    example: 5,
    description: 'Closed/resolved inquiries',
  })
  closedInquiries: number;

  @ApiProperty({
    example: 15420,
    description: 'Total page views across all cars',
  })
  totalViews: number;

  @ApiProperty({
    example: 2840,
    description: 'Views in the current month',
  })
  monthlyViews: number;

  @ApiProperty({
    example: 5.5,
    description: 'Inquiry to sale conversion rate percentage',
  })
  conversionRate: number;

  @ApiProperty({
    example: 32500.50,
    description: 'Average car price in inventory',
  })
  averagePrice: number;

  @ApiProperty({
    example: 8,
    description: 'Featured cars currently displayed',
  })
  featuredCars: number;

  @ApiProperty({
    example: 15,
    description: 'Average days cars stay in inventory',
  })
  averageDaysInInventory: number;
}