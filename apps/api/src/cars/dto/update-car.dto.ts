import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @ApiProperty({ 
    description: 'Car ID to update', 
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}