import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/auth/login.dto';
import { RefreshTokenDto } from '../dto/auth/refresh-token.dto';
import { AuthEntity } from '../entities/auth.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticate admin with email and password. Returns JWT tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Account locked due to too many failed attempts',
  })
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthEntity> {
    // LocalAuthGuard has already validated the credentials and populated req.user
    // Now generate tokens for the authenticated user
    return this.authService.generateTokens(req.user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthEntity> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin logout',
    description: 'Invalidate refresh token and log out admin.',
  })
  @ApiResponse({
    status: 204,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(@Request() req): Promise<void> {
    return this.authService.logout(req.user.id);
  }
}
