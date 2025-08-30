import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ChartDataPointEntity {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Label for the data point (usually date or category)',
  })
  @Expose()
  label: string;

  @ApiProperty({
    example: 25,
    description: 'Value for the data point',
  })
  @Expose()
  value: number;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Optional color for the data point',
    required: false,
  })
  @Expose()
  color?: string;

  constructor(data: Partial<ChartDataPointEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class ChartDatasetEntity {
  @ApiProperty({
    example: 'Car Views',
    description: 'Label for the dataset',
  })
  @Expose()
  label: string;

  @ApiProperty({
    type: [Number],
    example: [12, 19, 3, 5, 2, 3, 10],
    description: 'Array of numeric data points',
  })
  @Expose()
  data: number[];

  @ApiProperty({
    example: '#3B82F6',
    description: 'Background color for the dataset',
    required: false,
  })
  @Expose()
  backgroundColor?: string;

  @ApiProperty({
    example: '#2563EB',
    description: 'Border color for the dataset',
    required: false,
  })
  @Expose()
  borderColor?: string;

  @ApiProperty({
    example: 2,
    description: 'Border width for the dataset',
    required: false,
  })
  @Expose()
  borderWidth?: number;

  constructor(data: Partial<ChartDatasetEntity>) {
    Object.assign(this, data);
  }
}

@Exclude()
export class ChartDataEntity {
  @ApiProperty({
    type: [String],
    example: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    description: 'Labels for the chart data points',
  })
  @Expose()
  labels: string[];

  @ApiProperty({
    type: [ChartDatasetEntity],
    description: 'Datasets for the chart',
  })
  @Expose()
  @Type(() => ChartDatasetEntity)
  datasets: ChartDatasetEntity[];

  @ApiProperty({
    example: 'line',
    description: 'Suggested chart type for this data',
    required: false,
  })
  @Expose()
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';

  constructor(data: Partial<ChartDataEntity>) {
    Object.assign(this, data);

    if (data.datasets) {
      this.datasets = data.datasets.map(dataset => new ChartDatasetEntity(dataset));
    }
  }
}

@Exclude()
export class SalesChartEntity extends ChartDataEntity {
  @ApiProperty({
    example: 125000,
    description: 'Total sales value for the period',
  })
  @Expose()
  totalSales: number;

  @ApiProperty({
    example: 28500.50,
    description: 'Average sale price',
  })
  @Expose()
  averagePrice: number;

  @ApiProperty({
    example: 15.5,
    description: 'Percentage change from previous period',
  })
  @Expose()
  growthPercentage: number;

  constructor(data: Partial<SalesChartEntity>) {
    super(data);
    Object.assign(this, data);
  }
}

@Exclude()
export class ViewsChartEntity extends ChartDataEntity {
  @ApiProperty({
    example: 15420,
    description: 'Total views for the period',
  })
  @Expose()
  totalViews: number;

  @ApiProperty({
    example: 512,
    description: 'Average views per day',
  })
  @Expose()
  averagePerDay: number;

  @ApiProperty({
    example: 850,
    description: 'Peak views in a single day',
  })
  @Expose()
  peakViews: number;

  constructor(data: Partial<ViewsChartEntity>) {
    super(data);
    Object.assign(this, data);
  }
}

@Exclude()
export class InquiryChartEntity extends ChartDataEntity {
  @ApiProperty({
    example: 85,
    description: 'Total inquiries for the period',
  })
  @Expose()
  totalInquiries: number;

  @ApiProperty({
    example: 2.8,
    description: 'Average inquiries per day',
  })
  @Expose()
  averagePerDay: number;

  @ApiProperty({
    example: 6.8,
    description: 'Conversion rate percentage',
  })
  @Expose()
  conversionRate: number;

  constructor(data: Partial<InquiryChartEntity>) {
    super(data);
    Object.assign(this, data);
  }
}