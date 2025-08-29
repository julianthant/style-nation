import axios from '@/lib/axios';
import { axiosAuth } from '@/lib/axios';
import type { Car } from '@/lib/types/car';

export interface SearchCarsParams {
  search?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  condition?: string[];
  transmission?: string[];
  fuelType?: string[];
  bodyType?: string[];
  status?: string[];
  featured?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PopularMake {
  make: string;
  count: number;
}

export interface CarStatistics {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  reservedCars: number;
  featuredCars: number;
  totalViews: number;
}

class CarsAPI {
  // Public endpoints (no authentication required)
  
  async getCars(params: SearchCarsParams = {}): Promise<CarsResponse> {
    const response = await axios.get('/cars', { params });
    return response.data;
  }

  async getCar(id: string): Promise<Car> {
    const response = await axios.get(`/cars/${id}`);
    return response.data;
  }

  async getFeaturedCars(limit = 10): Promise<Car[]> {
    const response = await axios.get('/cars/featured', { 
      params: { limit } 
    });
    return response.data;
  }

  async getPopularMakes(limit = 20): Promise<PopularMake[]> {
    const response = await axios.get('/cars/popular-makes', { 
      params: { limit } 
    });
    return response.data;
  }

  async incrementViewCount(id: string): Promise<void> {
    await axios.post(`/cars/${id}/views`);
  }

  // Admin endpoints (authentication required)
  
  async createCar(carData: any): Promise<Car> {
    const response = await axiosAuth.post('/cars', carData);
    return response.data;
  }

  async updateCar(id: string, carData: any): Promise<Car> {
    const response = await axiosAuth.patch(`/cars/${id}`, carData);
    return response.data;
  }

  async deleteCar(id: string): Promise<void> {
    await axiosAuth.delete(`/cars/${id}`);
  }

  async hardDeleteCar(id: string): Promise<void> {
    await axiosAuth.delete(`/cars/${id}/hard`);
  }

  async getStatistics(): Promise<CarStatistics> {
    const response = await axiosAuth.get('/cars/admin/statistics');
    return response.data;
  }

  // Image management
  
  async uploadImages(carId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await axiosAuth.post(
      `/cars/upload/${carId}/images`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async updateImage(imageId: string, updateData: any): Promise<any> {
    const response = await axiosAuth.patch(`/cars/images/${imageId}`, updateData);
    return response.data;
  }

  async deleteImage(imageId: string): Promise<void> {
    await axiosAuth.delete(`/cars/images/${imageId}`);
  }

  async validateImages(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await axiosAuth.post(
      '/cars/upload/validate',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Featured cars management
  
  async featureCar(id: string, featuredUntil?: Date): Promise<Car> {
    const response = await axiosAuth.patch(`/cars/${id}/feature`, {
      featuredUntil: featuredUntil?.toISOString()
    });
    return response.data;
  }

  async unfeatureCar(id: string): Promise<void> {
    await axiosAuth.delete(`/cars/${id}/feature`);
  }
}

export const carsAPI = new CarsAPI();