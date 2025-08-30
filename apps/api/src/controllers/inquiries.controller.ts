import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { CreateInquiryDto } from '../dto/inquiry/create-inquiry.dto';
import { SearchInquiriesDto } from '../dto/inquiry/search-inquiries.dto';
import { UpdateInquiryDto } from '../dto/inquiry/update-inquiry.dto';
import { InquiryEntity } from '../entities/inquiry.entity';
import { InquiriesService } from '../services/inquiries.service';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  // Public endpoint - Submit inquiry from web app
  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a new inquiry about a car' })
  @ApiResponse({
    status: 201,
    description: 'Inquiry submitted successfully',
    type: InquiryEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  // Admin endpoints - Require authentication

  @Get()
  @ApiOperation({ summary: 'Get all inquiries with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Inquiries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        inquiries: { type: 'array', items: { $ref: '#/components/schemas/InquiryEntity' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  async findAll(@Query() searchDto: SearchInquiriesDto) {
    return this.inquiriesService.findAll(searchDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get inquiry statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalInquiries: { type: 'number', example: 150 },
        newInquiries: { type: 'number', example: 25 },
        contactedInquiries: { type: 'number', example: 85 },
        closedInquiries: { type: 'number', example: 40 },
      },
    },
  })
  async getStatistics() {
    return this.inquiriesService.getStatistics();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent inquiries for dashboard' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Recent inquiries retrieved successfully',
    type: [InquiryEntity],
  })
  async getRecentInquiries(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inquiriesService.getRecentInquiries(limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry by ID' })
  @ApiParam({
    name: 'id',
    description: 'Inquiry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Inquiry retrieved successfully', type: InquiryEntity })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inquiry status' })
  @ApiParam({
    name: 'id',
    description: 'Inquiry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Inquiry updated successfully', type: InquiryEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInquiryDto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inquiry' })
  @ApiParam({
    name: 'id',
    description: 'Inquiry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Inquiry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.inquiriesService.remove(id);
  }
}

