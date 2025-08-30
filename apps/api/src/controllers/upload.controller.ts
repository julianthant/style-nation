import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Param,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CarsService } from '../services/cars.service';
import { StorageService } from '../storage/storage.service';
import { CarImageEntity } from '../entities/car-image.entity';
import { Role } from '@prisma/client';

@ApiTags('cars')
@Controller('cars/upload')
export class UploadController {
  constructor(
    private readonly carsService: CarsService,
    private readonly storageService: StorageService,
  ) {}

  @Post(':carId/images')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images at once
  @ApiOperation({ summary: 'Upload multiple images for a car' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ 
    name: 'carId', 
    description: 'Car ID', 
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        isPrimary: {
          type: 'boolean',
          description: 'Whether the first image should be set as primary',
          default: false,
        },
        startOrder: {
          type: 'number',
          description: 'Starting order number for images',
          default: 1,
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Images uploaded successfully', 
    type: [CarImageEntity] 
  })
  @ApiResponse({ status: 400, description: 'Invalid file or car ID' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async uploadImages(
    @Param('carId', ParseUUIDPipe) carId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { isPrimary?: string; startOrder?: string },
  ) {
    // Validate files
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per upload');
    }

    // Validate each file
    files.forEach((file) => {
      this.storageService.validateImageFile(file);
    });

    try {
      // Upload files to Supabase Storage
      const uploadResults = await this.storageService.uploadMultipleFiles(
        files.map((file) => ({
          buffer: file.buffer,
          filename: file.originalname,
          contentType: file.mimetype,
        })),
      );

      // Extract URLs for car images
      const imageUrls = uploadResults.map((result) => result.url);

      // Parse body parameters
      const isPrimary = body.isPrimary === 'true';
      const startOrder = body.startOrder ? parseInt(body.startOrder, 10) : 1;

      // Save images to database via cars service
      const carImages = await this.carsService.uploadImages(carId, imageUrls, {
        carId,
        isPrimary,
        order: startOrder,
      });

      return carImages;
    } catch (error) {
      // If database save fails, clean up uploaded files
      console.error('Failed to save car images:', error);
      throw new BadRequestException(
        'Failed to upload images. Please try again.',
      );
    }
  }

  @Post('validate')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Validate images without uploading' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Images are valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalname: { type: 'string' },
              size: { type: 'number' },
              mimetype: { type: 'string' },
            },
          },
        },
      },
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid files' })
  async validateImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed');
    }

    // Validate each file
    files.forEach((file) => {
      this.storageService.validateImageFile(file);
    });

    return {
      valid: true,
      files: files.map((file) => ({
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      })),
    };
  }
}