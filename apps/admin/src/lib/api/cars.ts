import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  // In a real app, we'd get the JWT token from storage/context
  // For now, we'll assume the API allows admin operations
  return config;
});

// Car interfaces
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  vin: string;
  condition: 'NEW' | 'USED' | 'CERTIFIED_PREOWNED';
  transmissionType: 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DUAL_CLUTCH';
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUG_IN_HYBRID';
  bodyType: 'SEDAN' | 'SUV' | 'TRUCK' | 'COUPE' | 'CONVERTIBLE' | 'WAGON' | 'VAN' | 'HATCHBACK';
  exteriorColor: string;
  interiorColor: string;
  engineSize?: string;
  features: string[];
  description: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE';
  featured: boolean;
  featuredUntil?: string;
  facebookPostId?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  images: CarImage[];
  creator?: {
    id: string;
    email: string;
  };
}

export interface CarImage {
  id: string;
  carId: string;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface SearchCarsParams {
  page?: number;
  limit?: number;
  search?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  condition?: string[];
  status?: string[];
  transmission?: string[];
  fuelType?: string[];
  bodyType?: string[];
  featured?: boolean;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'mileage_low' | 'mileage_high' | 'views' | 'alphabetical';
}

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CarStatistics {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  reservedCars: number;
  featuredCars: number;
  totalViews: number;
}

export interface CreateCarData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  vin: string;
  condition: Car['condition'];
  transmissionType: Car['transmissionType'];
  fuelType: Car['fuelType'];
  bodyType: Car['bodyType'];
  exteriorColor: string;
  interiorColor: string;
  engineSize?: string;
  features: string[];
  description: string;
  status?: Car['status'];
  featured?: boolean;
  createdBy: string;
}

export interface UpdateCarData extends Partial<CreateCarData> {}

// Cars API class
export class CarsAPI {
  // Get all cars with filtering and pagination
  async getCars(params: SearchCarsParams = {}): Promise<CarsResponse> {
    const response = await apiClient.get('/cars', { params });
    return response.data;
  }

  // Get single car by ID
  async getCar(id: string): Promise<Car> {
    const response = await apiClient.get(`/cars/${id}`);
    return response.data;
  }

  // Create new car
  async createCar(carData: CreateCarData): Promise<Car> {
    const response = await apiClient.post('/cars', carData);
    return response.data;
  }

  // Update car
  async updateCar(id: string, carData: UpdateCarData): Promise<Car> {
    const response = await apiClient.patch(`/cars/${id}`, carData);
    return response.data;
  }

  // Delete car (soft delete)
  async deleteCar(id: string): Promise<void> {
    await apiClient.delete(`/cars/${id}`);
  }

  // Hard delete car
  async hardDeleteCar(id: string): Promise<void> {
    await apiClient.delete(`/cars/${id}/hard`);
  }

  // Get car statistics
  async getStatistics(): Promise<CarStatistics> {
    const response = await apiClient.get('/cars/admin/statistics');
    return response.data;
  }

  // Feature/unfeature car
  async featureCar(id: string, featuredUntil?: Date): Promise<Car> {
    const body = featuredUntil ? { featuredUntil: featuredUntil.toISOString() } : {};
    const response = await apiClient.patch(`/cars/${id}/feature`, body);
    return response.data;
  }

  async unfeatureCar(id: string): Promise<void> {
    await apiClient.delete(`/cars/${id}/feature`);
  }

  // Toggle featured status (boolean field)
  async toggleFeaturedStatus(id: string, featured: boolean): Promise<Car> {
    const response = await apiClient.patch(`/cars/${id}/featured`, { featured });
    return response.data;
  }

  // Image management
  async uploadImages(carId: string, imageUrls: string[]): Promise<CarImage[]> {
    const response = await apiClient.post(`/cars/${carId}/images`, { imageUrls });
    return response.data;
  }

  async updateImage(imageId: string, updateData: { isPrimary?: boolean; order?: number }): Promise<CarImage> {
    const response = await apiClient.patch(`/cars/images/${imageId}`, updateData);
    return response.data;
  }

  async deleteImage(imageId: string): Promise<void> {
    await apiClient.delete(`/cars/images/${imageId}`);
  }

  // Get popular makes for filters
  async getPopularMakes(limit = 20): Promise<Array<{ make: string; count: number }>> {
    const response = await apiClient.get('/cars/popular-makes', { params: { limit } });
    return response.data;
  }

  // Get featured cars
  async getFeaturedCars(limit = 10): Promise<Car[]> {
    const response = await apiClient.get('/cars/featured', { params: { limit } });
    return response.data;
  }

  // Bulk operations
  async bulkUpdateStatus(carIds: string[], status: Car['status']): Promise<void> {
    // Note: This would need to be implemented in the backend
    await Promise.all(carIds.map(id => this.updateCar(id, { status })));
  }

  async bulkDelete(carIds: string[]): Promise<void> {
    // Note: This would need to be implemented in the backend
    await Promise.all(carIds.map(id => this.deleteCar(id)));
  }

  async bulkFeature(carIds: string[], featured: boolean): Promise<void> {
    // Note: This would need to be implemented in the backend
    await Promise.all(carIds.map(id => this.toggleFeaturedStatus(id, featured)));
  }
}

// Export singleton instance
export const carsApi = new CarsAPI();

// Helper functions for formatting and validation
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatMileage = (mileage?: number): string => {
  if (!mileage) return 'N/A';
  return new Intl.NumberFormat('en-US').format(mileage) + ' miles';
};

export const getStatusColor = (status: Car['status']): string => {
  switch (status) {
    case 'AVAILABLE': return 'green';
    case 'SOLD': return 'gray';
    case 'RESERVED': return 'yellow';
    case 'INACTIVE': return 'red';
    default: return 'gray';
  }
};

export const getStatusLabel = (status: Car['status']): string => {
  switch (status) {
    case 'AVAILABLE': return 'Available';
    case 'SOLD': return 'Sold';
    case 'RESERVED': return 'Reserved';
    case 'INACTIVE': return 'Inactive';
    default: return status;
  }
};

export const getConditionLabel = (condition: Car['condition']): string => {
  switch (condition) {
    case 'NEW': return 'New';
    case 'USED': return 'Used';
    case 'CERTIFIED_PREOWNED': return 'Certified Pre-owned';
    default: return condition;
  }
};

// Form validation schemas (using Zod)
import { z } from 'zod';

export const createCarSchema = z.object({
  make: z.string().min(1, 'Make is required').max(50, 'Make too long'),
  model: z.string().min(1, 'Model is required').max(50, 'Model too long'),
  year: z.number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  price: z.number().min(0, 'Price must be positive'),
  mileage: z.number().min(0, 'Mileage must be positive').optional(),
  vin: z.string().length(17, 'VIN must be exactly 17 characters'),
  condition: z.enum(['NEW', 'USED', 'CERTIFIED_PREOWNED']),
  transmissionType: z.enum(['MANUAL', 'AUTOMATIC', 'CVT', 'DUAL_CLUTCH']),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID']),
  bodyType: z.enum(['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'HATCHBACK']),
  exteriorColor: z.string().min(1, 'Exterior color is required'),
  interiorColor: z.string().min(1, 'Interior color is required'),
  engineSize: z.string().optional(),
  features: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'INACTIVE']).default('AVAILABLE'),
  featured: z.boolean().default(false),
});

export const updateCarSchema = createCarSchema.partial();

export type CreateCarFormData = z.infer<typeof createCarSchema>;
export type UpdateCarFormData = z.infer<typeof updateCarSchema>;