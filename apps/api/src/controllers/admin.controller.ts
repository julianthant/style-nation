import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentAdmin } from '../decorators/current-admin.decorator';
import { AdminEntity } from '../entities/admin.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  @ApiOperation({ 
    summary: 'Get current admin profile',
    description: 'Retrieve the profile information for the currently authenticated admin'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
    type: AdminEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
  })
  async getProfile(@CurrentAdmin() admin: any): Promise<AdminEntity> {
    return this.adminService.getProfile(admin.id);
  }


  @Patch('profile')
  @ApiOperation({ 
    summary: 'Update admin profile',
    description: 'Update profile information for the currently authenticated admin'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile updated successfully',
    type: AdminEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email is already in use',
  })
  async updateProfile(
    @CurrentAdmin() admin: any,
    @Body() updateData: { name?: string; email?: string },
  ): Promise<AdminEntity> {
    return this.adminService.updateProfile(admin.id, updateData);
  }
}