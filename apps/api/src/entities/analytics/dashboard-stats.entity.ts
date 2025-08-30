import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DashboardStatsEntity {
  @ApiProperty({
    example: 150,
    description: 'Total number of cars in inventory',
  })
  @Expose()
  totalCars: number;

  @ApiProperty({
    example: 120,
    description: 'Number of available cars',
  })
  @Expose()
  availableCars: number;

  @ApiProperty({
    example: 25,
    description: 'Number of sold cars',
  })
  @Expose()
  soldCars: number;

  @ApiProperty({
    example: 5,
    description: 'Number of reserved cars',
  })
  @Expose()
  reservedCars: number;

  @ApiProperty({
    example: 85,
    description: 'Total customer inquiries received',
  })
  @Expose()
  totalInquiries: number;

  @ApiProperty({
    example: 12,
    description: 'New inquiries (not yet contacted)',
  })
  @Expose()
  newInquiries: number;

  @ApiProperty({
    example: 68,
    description: 'Inquiries that have been contacted',
  })
  @Expose()
  contactedInquiries: number;

  @ApiProperty({
    example: 5,
    description: 'Closed/resolved inquiries',
  })
  @Expose()
  closedInquiries: number;

  @ApiProperty({
    example: 15420,
    description: 'Total page views across all cars',
  })
  @Expose()
  totalViews: number;

  @ApiProperty({
    example: 2840,
    description: 'Views in the current month',
  })
  @Expose()
  monthlyViews: number;

  @ApiProperty({
    example: 5.5,
    description: 'Inquiry to sale conversion rate percentage',
  })
  @Expose()
  conversionRate: number;

  @ApiProperty({
    example: 32500.50,
    description: 'Average car price in inventory',
  })
  @Expose()
  averagePrice: number;

  @ApiProperty({
    example: 8,
    description: 'Featured cars currently displayed',
  })
  @Expose()
  featuredCars: number;

  @ApiProperty({
    example: 15,
    description: 'Average days cars stay in inventory',
  })
  @Expose()
  averageDaysInInventory: number;

  constructor(data: Partial<DashboardStatsEntity>) {
    Object.assign(this, data);
  }
}