import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { InquiryStatus } from '@prisma/client';

export class SearchInquiriesDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Filter by car ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  carId?: string;

  @IsOptional()
  @IsEnum(InquiryStatus)
  @ApiPropertyOptional({
    description: 'Filter by inquiry status',
    enum: InquiryStatus,
    example: InquiryStatus.NEW,
  })
  status?: InquiryStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 20;
}