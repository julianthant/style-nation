import { ApiProperty } from '@nestjs/swagger';

export class InquiryTrendDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date for the trend data point',
  })
  date: string;

  @ApiProperty({
    example: 12,
    description: 'Number of inquiries on this date',
  })
  count: number;

  @ApiProperty({
    example: 8,
    description: 'Number of new inquiries on this date',
  })
  newCount: number;

  @ApiProperty({
    example: 3,
    description: 'Number of inquiries contacted on this date',
  })
  contactedCount: number;

  @ApiProperty({
    example: 1,
    description: 'Number of inquiries closed on this date',
  })
  closedCount: number;
}

export class InquiryAnalyticsDto {
  @ApiProperty({
    type: [InquiryTrendDto],
    description: 'Inquiry trends over time',
  })
  trends: InquiryTrendDto[];

  @ApiProperty({
    example: 85,
    description: 'Total inquiries in the period',
  })
  totalInquiries: number;

  @ApiProperty({
    example: 2.3,
    description: 'Average inquiries per day',
  })
  averagePerDay: number;

  @ApiProperty({
    example: 18,
    description: 'Peak inquiries in a single day',
  })
  peakDay: number;

  @ApiProperty({
    example: '2024-01-20',
    description: 'Date with the most inquiries',
  })
  peakDate: string;

  @ApiProperty({
    example: 4.5,
    description: 'Average response time in hours',
  })
  averageResponseTime: number;

  @ApiProperty({
    example: 6.8,
    description: 'Inquiry to sale conversion rate percentage',
  })
  conversionRate: number;
}

export class InquiryStatusBreakdownDto {
  @ApiProperty({
    example: 'NEW',
    description: 'Inquiry status',
  })
  status: string;

  @ApiProperty({
    example: 25,
    description: 'Count of inquiries with this status',
  })
  count: number;

  @ApiProperty({
    example: 29.4,
    description: 'Percentage of total inquiries',
  })
  percentage: number;
}

export class PeakHoursDto {
  @ApiProperty({
    example: 14,
    description: 'Hour of day (0-23)',
  })
  hour: number;

  @ApiProperty({
    example: 15,
    description: 'Number of inquiries received at this hour',
  })
  count: number;

  @ApiProperty({
    example: 17.6,
    description: 'Percentage of daily inquiries',
  })
  percentage: number;
}