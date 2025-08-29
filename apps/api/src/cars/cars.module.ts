import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CarsController, UploadController],
  providers: [CarsService],
  exports: [CarsService], // Export service for use in other modules (e.g., Facebook integration)
})
export class CarsModule {}