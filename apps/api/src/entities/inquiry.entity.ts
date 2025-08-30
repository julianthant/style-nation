import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Car, CarImage, Inquiry, InquiryStatus } from '@prisma/client';
import { CarEntity } from './car.entity';

type InquiryWithCar = Inquiry & {
  car?: Car & {
    images?: CarImage[];
  };
};

export class InquiryEntity implements Inquiry {
  constructor(partial: Partial<InquiryWithCar>) {
    Object.assign(this, partial);

    // Handle nested relations
    if (partial.car) {
      this.car = new CarEntity(partial.car);
    }
  }

  @ApiProperty({
    description: 'Unique identifier for the inquiry',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the car this inquiry is about',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  carId: string;

  @ApiProperty({
    description: 'Name of the person making the inquiry',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the person making the inquiry',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the person making the inquiry',
    example: '+1-555-123-4567',
  })
  phone: string | null;

  @ApiProperty({
    description: 'Inquiry message',
    example: 'I am interested in learning more about this vehicle.',
  })
  message: string;

  @ApiProperty({
    description: 'Status of the inquiry',
    enum: InquiryStatus,
    example: InquiryStatus.NEW,
  })
  status: InquiryStatus;

  @ApiProperty({
    description: 'Date and time when the inquiry was created',
    example: '2023-12-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the inquiry was last updated',
    example: '2023-12-01T10:00:00.000Z',
  })
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional({
    description: 'Car details (included when expanded)',
    type: () => CarEntity,
  })
  car?: CarEntity;
}
