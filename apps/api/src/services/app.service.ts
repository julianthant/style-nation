import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Style Nation API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Will be updated when we add actual health checks
    };
  }
}