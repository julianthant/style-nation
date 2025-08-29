import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { SearchCarsDto, SortBy } from './dto/search-cars.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UpdateImageDto, UploadImageDto } from './dto/upload-image.dto';
import { CarImageEntity } from './entities/car-image.entity';
import { CarEntity } from './entities/car.entity';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  // Create a new car listing
  async create(createCarDto: CreateCarDto, createdBy: string): Promise<CarEntity> {
    // Check for duplicate VIN
    const existingCar = await this.prisma.car.findUnique({
      where: { vin: createCarDto.vin },
    });

    if (existingCar) {
      throw new ConflictException(`Car with VIN ${createCarDto.vin} already exists`);
    }

    const car = await this.prisma.car.create({
      data: {
        ...createCarDto,
        createdBy,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        creator: true,
      },
    });

    return new CarEntity(car);
  }

  // Get all cars with filtering, sorting, and pagination
  async findAll(searchDto: SearchCarsDto): Promise<{
    cars: CarEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      condition,
      transmission,
      fuelType,
      bodyType,
      status = [ListingStatus.AVAILABLE],
      featured,
      sortBy = SortBy.NEWEST,
      page = 1,
      limit = 20,
    } = searchDto;

    // Build where clause
    const where: Prisma.CarWhereInput = {
      status: { in: status },
      ...(search && {
        OR: [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { features: { hasSome: [search] } },
        ],
      }),
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(minYear && { year: { gte: minYear } }),
      ...(maxYear && { year: { lte: maxYear } }),
      ...(maxMileage && { mileage: { lte: maxMileage } }),
      ...(condition?.length && { condition: { in: condition } }),
      ...(transmission?.length && { transmissionType: { in: transmission } }),
      ...(fuelType?.length && { fuelType: { in: fuelType } }),
      ...(bodyType?.length && { bodyType: { in: bodyType } }),
      ...(featured && { featuredUntil: { gte: new Date() } }),
    };

    // Build order by clause
    const orderBy = this.buildOrderBy(sortBy);

    // Execute queries in parallel
    const [cars, total] = await Promise.all([
      this.prisma.car.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          creator: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.car.count({ where }),
    ]);

    return {
      cars: cars.map(car => new CarEntity(car)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get featured cars
  async findFeatured(limit: number = 10): Promise<CarEntity[]> {
    const cars = await this.prisma.car.findMany({
      where: {
        status: ListingStatus.AVAILABLE,
        featuredUntil: { gte: new Date() },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return cars.map(car => new CarEntity(car));
  }

  // Get car by ID
  async findOne(id: string): Promise<CarEntity> {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        creator: true,
        inquiries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return new CarEntity(car);
  }

  // Update car
  async update(id: string, updateCarDto: UpdateCarDto): Promise<CarEntity> {
    // Check if car exists
    await this.findOne(id);

    // Check for VIN conflicts if VIN is being updated
    if (updateCarDto.vin) {
      const existingCar = await this.prisma.car.findFirst({
        where: {
          vin: updateCarDto.vin,
          NOT: { id },
        },
      });

      if (existingCar) {
        throw new ConflictException(`Car with VIN ${updateCarDto.vin} already exists`);
      }
    }

    const car = await this.prisma.car.update({
      where: { id },
      data: updateCarDto,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        creator: true,
      },
    });

    return new CarEntity(car);
  }

  // Soft delete car (change status to INACTIVE)
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    await this.prisma.car.update({
      where: { id },
      data: { status: ListingStatus.INACTIVE },
    });
  }

  // Hard delete car (admin only)
  async delete(id: string): Promise<void> {
    await this.findOne(id); // Check if exists

    // Delete related images first (cascade should handle this, but being explicit)
    await this.prisma.carImage.deleteMany({
      where: { carId: id },
    });

    await this.prisma.car.delete({
      where: { id },
    });
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.car.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  // Image management methods
  async uploadImages(
    carId: string,
    imageUrls: string[],
    uploadDto?: UploadImageDto
  ): Promise<CarImageEntity[]> {
    // Verify car exists
    await this.findOne(carId);

    const images = await Promise.all(
      imageUrls.map(async (url, index) => {
        const imageData = {
          carId,
          url,
          isPrimary: uploadDto?.isPrimary && index === 0 ? true : false,
          order: uploadDto?.order ? uploadDto.order + index : index + 1,
        };

        return this.prisma.carImage.create({
          data: imageData,
        });
      })
    );

    return images.map(image => new CarImageEntity(image));
  }

  async updateImage(imageId: string, updateDto: UpdateImageDto): Promise<CarImageEntity> {
    const image = await this.prisma.carImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // If setting as primary, unset all other primary images for this car
    if (updateDto.isPrimary) {
      await this.prisma.carImage.updateMany({
        where: {
          carId: image.carId,
          NOT: { id: imageId },
        },
        data: { isPrimary: false },
      });
    }

    const updatedImage = await this.prisma.carImage.update({
      where: { id: imageId },
      data: updateDto,
    });

    return new CarImageEntity(updatedImage);
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await this.prisma.carImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    await this.prisma.carImage.delete({
      where: { id: imageId },
    });
  }

  // Get car statistics (for admin dashboard)
  async getStatistics() {
    const [totalCars, availableCars, soldCars, reservedCars, featuredCars, totalViews] =
      await Promise.all([
        this.prisma.car.count(),
        this.prisma.car.count({ where: { status: ListingStatus.AVAILABLE } }),
        this.prisma.car.count({ where: { status: ListingStatus.SOLD } }),
        this.prisma.car.count({ where: { status: ListingStatus.RESERVED } }),
        this.prisma.car.count({
          where: {
            status: ListingStatus.AVAILABLE,
            featuredUntil: { gte: new Date() },
          },
        }),
        this.prisma.car.aggregate({ _sum: { viewCount: true } }),
      ]);

    return {
      totalCars,
      availableCars,
      soldCars,
      reservedCars,
      featuredCars,
      totalViews: totalViews._sum.viewCount || 0,
    };
  }

  // Get popular makes/models for filters
  async getPopularMakes(limit: number = 20): Promise<{ make: string; count: number }[]> {
    const result = await this.prisma.car.groupBy({
      by: ['make'],
      _count: { make: true },
      where: { status: ListingStatus.AVAILABLE },
      orderBy: { _count: { make: 'desc' } },
      take: limit,
    });

    return result.map(item => ({
      make: item.make,
      count: item._count.make,
    }));
  }

  // Featured cars management
  async featureCar(id: string, featuredUntil?: Date): Promise<CarEntity> {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    // Default to 30 days if no expiration date provided
    const defaultFeaturedUntil = new Date();
    defaultFeaturedUntil.setDate(defaultFeaturedUntil.getDate() + 30);

    const updatedCar = await this.prisma.car.update({
      where: { id },
      data: {
        featuredUntil: featuredUntil || defaultFeaturedUntil,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        creator: true,
      },
    });

    return new CarEntity(updatedCar);
  }

  async unfeatureCar(id: string): Promise<void> {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    await this.prisma.car.update({
      where: { id },
      data: {
        featuredUntil: null,
      },
    });
  }

  // Private helper method for building sort order
  private buildOrderBy(sortBy: SortBy): Prisma.CarOrderByWithRelationInput {
    switch (sortBy) {
      case SortBy.PRICE_ASC:
        return { price: 'asc' };
      case SortBy.PRICE_DESC:
        return { price: 'desc' };
      case SortBy.YEAR_ASC:
        return { year: 'asc' };
      case SortBy.YEAR_DESC:
        return { year: 'desc' };
      case SortBy.MILEAGE_ASC:
        return { mileage: 'asc' };
      case SortBy.MILEAGE_DESC:
        return { mileage: 'desc' };
      case SortBy.MAKE_ASC:
        return { make: 'asc' };
      case SortBy.MAKE_DESC:
        return { make: 'desc' };
      case SortBy.OLDEST:
        return { createdAt: 'asc' };
      case SortBy.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }
}
