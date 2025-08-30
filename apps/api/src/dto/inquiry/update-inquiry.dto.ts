import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';

export class UpdateInquiryDto {
  @IsOptional()
  @IsEnum(InquiryStatus)
  @ApiPropertyOptional({
    description: 'Status of the inquiry',
    enum: InquiryStatus,
    example: InquiryStatus.CONTACTED,
  })
  status?: InquiryStatus;
}