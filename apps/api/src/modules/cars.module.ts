import { Module } from '@nestjs/common';
import { CarsController } from '../controllers/cars.controller';
import { CarsService } from '../services/cars.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}