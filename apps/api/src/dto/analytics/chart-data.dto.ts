import { ApiProperty } from '@nestjs/swagger';

export class ChartDataPointDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Label for the data point (usually date or category)',
  })
  label: string;

  @ApiProperty({
    example: 25,
    description: 'Value for the data point',
  })
  value: number;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Optional color for the data point',
    required: false,
  })
  color?: string;
}

export class ChartDatasetDto {
  @ApiProperty({
    example: 'Car Views',
    description: 'Label for the dataset',
  })
  label: string;

  @ApiProperty({
    type: [Number],
    example: [12, 19, 3, 5, 2, 3, 10],
    description: 'Array of numeric data points',
  })
  data: number[];

  @ApiProperty({
    example: '#3B82F6',
    description: 'Background color for the dataset',
    required: false,
  })
  backgroundColor?: string;

  @ApiProperty({
    example: '#2563EB',
    description: 'Border color for the dataset',
    required: false,
  })
  borderColor?: string;

  @ApiProperty({
    example: 2,
    description: 'Border width for the dataset',
    required: false,
  })
  borderWidth?: number;
}

export class ChartDataDto {
  @ApiProperty({
    type: [String],
    example: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    description: 'Labels for the chart data points',
  })
  labels: string[];

  @ApiProperty({
    type: [ChartDatasetDto],
    description: 'Datasets for the chart',
  })
  datasets: ChartDatasetDto[];

  @ApiProperty({
    example: 'line',
    description: 'Suggested chart type for this data',
    required: false,
  })
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
}

export class SalesChartDto extends ChartDataDto {
  @ApiProperty({
    example: 125000,
    description: 'Total sales value for the period',
  })
  totalSales: number;

  @ApiProperty({
    example: 28500.50,
    description: 'Average sale price',
  })
  averagePrice: number;

  @ApiProperty({
    example: 15.5,
    description: 'Percentage change from previous period',
  })
  growthPercentage: number;
}

export class ViewsChartDto extends ChartDataDto {
  @ApiProperty({
    example: 15420,
    description: 'Total views for the period',
  })
  totalViews: number;

  @ApiProperty({
    example: 512,
    description: 'Average views per day',
  })
  averagePerDay: number;

  @ApiProperty({
    example: 850,
    description: 'Peak views in a single day',
  })
  peakViews: number;
}

export class InquiryChartDto extends ChartDataDto {
  @ApiProperty({
    example: 85,
    description: 'Total inquiries for the period',
  })
  totalInquiries: number;

  @ApiProperty({
    example: 2.8,
    description: 'Average inquiries per day',
  })
  averagePerDay: number;

  @ApiProperty({
    example: 6.8,
    description: 'Conversion rate percentage',
  })
  conversionRate: number;
}