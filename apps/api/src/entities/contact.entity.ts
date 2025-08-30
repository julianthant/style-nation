import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Contact } from '@prisma/client';

export class ContactEntity implements Contact {
  constructor({ ...data }: Partial<ContactEntity>) {
    Object.assign(this, data);
  }

  @ApiProperty({
    description: 'Unique identifier for the contact',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the contact',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the contact',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+1-555-0123',
    required: false,
  })
  phone: string | null;

  @ApiProperty({
    description: 'Subject of the contact message',
    example: 'Inquiry about vehicle availability',
  })
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I am interested in learning more about your available vehicles.',
  })
  message: string;

  @ApiProperty({
    description: 'Current status of the contact',
    example: 'NEW',
    enum: ['NEW', 'CONTACTED', 'CLOSED'],
  })
  status: 'NEW' | 'CONTACTED' | 'CLOSED';

  @ApiProperty({
    description: 'Date when the contact was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the contact was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}