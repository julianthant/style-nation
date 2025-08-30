import { Module } from '@nestjs/common';
import { InquiriesController } from '../controllers/inquiries.controller';
import { InquiriesService } from '../services/inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}