import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  imports: [PrismaModule],
  exports: [StorageService],
})
export class StorageModule {}
