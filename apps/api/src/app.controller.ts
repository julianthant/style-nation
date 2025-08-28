import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' },
      },
    },
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status',
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Protected route example' })
  @ApiResponse({
    status: 200,
    description: 'Protected data with authenticated user',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        authenticated_user: { type: 'object' },
      },
    },
  })
  async protected(@Req() req) {
    return {
      "message": "AuthGuard works 🎉",
      "authenticated_user": req.user
    };
  }
}