import { Module } from '@nestjs/common';
import { ContactController } from '../controllers/contact.controller';
import { InquiriesModule } from './inquiries.module';

@Module({
  imports: [InquiriesModule],
  controllers: [ContactController],
})
export class ContactModule {}