import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from './modules/auth.module';
import { AdminModule } from './modules/admin.module';
import { CarsModule } from './modules/cars.module';
import { UploadModule } from './modules/upload.module';
import { InquiriesModule } from './modules/inquiries.module';
import { ContactModule } from './modules/contact.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds in milliseconds
      limit: 100, // 100 requests per minute globally
    }]),
    PrismaModule,
    StorageModule,
    AuthModule,
    AdminModule,
    CarsModule,
    UploadModule,
    InquiriesModule,
    ContactModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}