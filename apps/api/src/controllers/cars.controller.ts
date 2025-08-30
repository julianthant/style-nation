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
import { SearchCarsDto } from '../dto/cars/search-cars.dto';
import { UpdateCarDto } from '../dto/cars/update-car.dto';
import { CreateCarDto } from '../dto/cars/create-car.dto';
import { UpdateImageDto, UploadImageDto } from '../dto/upload/upload-image.dto';
import { CarImageEntity } from '../entities/car-image.entity';
import { CarEntity } from '../entities/car.entity';
import { CarsService } from '../services/cars.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  // Public endpoints (no authentication required)

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all cars with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Cars retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        cars: { type: 'array', items: { $ref: '#/components/schemas/CarEntity' } },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 8 },
      },
    },
  })
  async findAll(@Query() searchDto: SearchCarsDto) {
    return this.carsService.findAll(searchDto);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured cars' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Featured cars retrieved successfully',
    type: [CarEntity],
  })
  async findFeatured(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.carsService.findFeatured(limitNum);
  }

  @Get('popular-makes')
  @Public()
  @ApiOperation({ summary: 'Get popular car makes for filters' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Popular makes retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          make: { type: 'string', example: 'Toyota' },
          count: { type: 'number', example: 15 },
        },
      },
    },
  })
  async getPopularMakes(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.carsService.getPopularMakes(limitNum);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Car retrieved successfully', type: CarEntity })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carsService.findOne(id);
  }

  @Post(':id/views')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment car view count' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'View count incremented successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async incrementViews(@Param('id', ParseUUIDPipe) id: string) {
    await this.carsService.incrementViewCount(id);
  }

  // Admin endpoints (Better Auth will handle authentication in Next.js admin)

  @Post()
  @ApiOperation({ summary: 'Create a new car listing' })
  @ApiResponse({ status: 201, description: 'Car created successfully', type: CarEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Car with this VIN already exists' })
  async create(@Body() createCarDto: CreateCarDto & { createdBy: string }) {
    return this.carsService.create(createCarDto, createCarDto.createdBy);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update car listing' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Car updated successfully', type: CarEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @ApiResponse({ status: 409, description: 'Car with this VIN already exists' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(id, updateCarDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete car (change status to INACTIVE)' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'Car deleted successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.carsService.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete car' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'Car permanently deleted' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.carsService.delete(id);
  }

  // Image management endpoints

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload images for a car' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully', type: [CarImageEntity] })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async uploadImages(
    @Param('id', ParseUUIDPipe) carId: string,
    @Body() body: { imageUrls: string[]; uploadDto?: UploadImageDto }
  ) {
    const { imageUrls, uploadDto } = body;
    return this.carsService.uploadImages(carId, imageUrls, uploadDto);
  }

  @Patch('images/:imageId')
  @ApiOperation({ summary: 'Update car image' })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Image updated successfully', type: CarImageEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async updateImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() updateImageDto: UpdateImageDto
  ) {
    return this.carsService.updateImage(imageId, updateImageDto);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete car image' })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    await this.carsService.deleteImage(imageId);
  }

  // Statistics endpoint

  @Get('admin/statistics')
  @ApiOperation({ summary: 'Get car statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCars: { type: 'number', example: 150 },
        availableCars: { type: 'number', example: 120 },
        soldCars: { type: 'number', example: 25 },
        reservedCars: { type: 'number', example: 3 },
        featuredCars: { type: 'number', example: 12 },
        totalViews: { type: 'number', example: 1543 },
      },
    },
  })
  async getStatistics() {
    return this.carsService.getStatistics();
  }

  // Featured cars management

  @Patch(':id/feature')
  @ApiOperation({ summary: 'Feature a car listing' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Car featured successfully', type: CarEntity })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async featureCar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { featuredUntil?: string }
  ) {
    const featuredUntil = body.featuredUntil ? new Date(body.featuredUntil) : undefined;
    return this.carsService.featureCar(id, featuredUntil);
  }

  @Delete(':id/feature')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove car from featured listings' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'Car unfeatured successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async unfeatureCar(@Param('id', ParseUUIDPipe) id: string) {
    await this.carsService.unfeatureCar(id);
  }

  @Patch(':id/featured')
  @ApiOperation({ summary: 'Toggle car featured status (permanent)' })
  @ApiParam({ name: 'id', description: 'Car ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: 'Car featured status updated successfully',
    type: CarEntity,
  })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async toggleFeaturedStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { featured: boolean }
  ) {
    return this.carsService.toggleFeaturedBoolean(id, body.featured);
  }
}
