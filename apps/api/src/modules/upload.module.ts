import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/upload.controller';
import { CarsModule } from './cars.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [CarsModule, StorageModule],
  controllers: [UploadController],
})
export class UploadModule {}