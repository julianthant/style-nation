import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class InquiryTrendEntity {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date for the trend data point',
  })
  @Expose()
  date: string;

  @ApiProperty({
    example: 12,
    description: 'Number of inquiries on this date',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 8,
    description: 'Number of new inquiries on this date',
  })
  @Expose()
  newCount: number;

  @ApiProperty({
    example: 3,
    description: 'Number of inquiries contacted on this date',
  })
  @Expose()
  contactedCount: number;

  @ApiProperty({
    example: 1,
    description: 'Number of inquiries closed on this date',
  })
  @Expose()
  closedCount: number;

  constructor(data: Partial<InquiryTrendEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class InquiryAnalyticsEntity {
  @ApiProperty({
    type: [InquiryTrendEntity],
    description: 'Inquiry trends over time',
  })
  @Expose()
  @Type(() => InquiryTrendEntity)
  trends: InquiryTrendEntity[];

  @ApiProperty({
    example: 85,
    description: 'Total inquiries in the period',
  })
  @Expose()
  totalInquiries: number;

  @ApiProperty({
    example: 2.3,
    description: 'Average inquiries per day',
  })
  @Expose()
  averagePerDay: number;

  @ApiProperty({
    example: 18,
    description: 'Peak inquiries in a single day',
  })
  @Expose()
  peakDay: number;

  @ApiProperty({
    example: '2024-01-20',
    description: 'Date with the most inquiries',
  })
  @Expose()
  peakDate: string;

  @ApiProperty({
    example: 4.5,
    description: 'Average response time in hours',
  })
  @Expose()
  averageResponseTime: number;

  @ApiProperty({
    example: 6.8,
    description: 'Inquiry to sale conversion rate percentage',
  })
  @Expose()
  conversionRate: number;

  constructor(data: Partial<InquiryAnalyticsEntity>) {
    Object.assign(this, data);

    if (data.trends) {
      this.trends = data.trends.map(trend => new InquiryTrendEntity(trend));
    }
  }
}

@Exclude()
export class InquiryStatusBreakdownEntity {
  @ApiProperty({
    example: 'NEW',
    description: 'Inquiry status',
  })
  @Expose()
  status: string;

  @ApiProperty({
    example: 25,
    description: 'Count of inquiries with this status',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 29.4,
    description: 'Percentage of total inquiries',
  })
  @Expose()
  percentage: number;

  constructor(data: Partial<InquiryStatusBreakdownEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class PeakHoursEntity {
  @ApiProperty({
    example: 14,
    description: 'Hour of day (0-23)',
  })
  @Expose()
  hour: number;

  @ApiProperty({
    example: 15,
    description: 'Number of inquiries received at this hour',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 17.6,
    description: 'Percentage of daily inquiries',
  })
  @Expose()
  percentage: number;

  constructor(data: Partial<PeakHoursEntity>) {
    Object.assign(this, data);
  }
}