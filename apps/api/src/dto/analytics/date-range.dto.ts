import { IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DateRangeDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date for analytics data (ISO format)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'End date for analytics data (ISO format)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    enum: ['7d', '30d', '90d', '1y', 'custom'],
    example: '30d',
    description: 'Predefined time period or custom for date range',
    required: false,
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d', '1y', 'custom'])
  period?: '7d' | '30d' | '90d' | '1y' | 'custom' = '30d';

  @ApiProperty({
    enum: ['day', 'week', 'month'],
    example: 'day',
    description: 'Grouping interval for time-series data',
    required: false,
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  interval?: 'day' | 'week' | 'month' = 'day';
}

export class AnalyticsQueryDto extends DateRangeDto {
  @ApiProperty({
    example: 10,
    description: 'Limit number of results returned',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiProperty({
    example: 'views',
    description: 'Sort results by specific field',
    required: false,
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    description: 'Sort order for results',
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}