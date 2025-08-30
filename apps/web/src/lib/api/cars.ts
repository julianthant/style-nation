import type { Car, Condition, Transmission, FuelType, BodyType, ListingStatus } from '@/lib/types/car';

// Unified API types matching backend exactly
export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  YEAR_ASC = 'year_asc',
  YEAR_DESC = 'year_desc',
  MILEAGE_ASC = 'mileage_asc',
  MILEAGE_DESC = 'mileage_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MAKE_ASC = 'make_asc',
  MAKE_DESC = 'make_desc',
}

export interface SearchCarsParams {
  search?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  condition?: Condition[];
  transmission?: Transmission[];
  fuelType?: FuelType[];
  bodyType?: BodyType[];
  status?: ListingStatus[];
  featured?: boolean;
  sortBy?: SortBy;
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

// Unified HTTP client that works both client-side and server-side
class CarsAPI {
  private baseURL: string;
  private isServer: boolean;

  constructor() {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Ensure base URL ends with a slash for proper URL construction
    this.baseURL = apiURL.endsWith('/') ? apiURL : apiURL + '/';
    this.isServer = typeof window === 'undefined';
  }

  private async request<T>(endpoint: string, options: RequestInit & { params?: any } = {}): Promise<T> {
    // Ensure endpoint doesn't start with / to avoid replacing the path
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(cleanEndpoint, this.baseURL);
    
    
    // Add query params
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 0) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (v !== undefined && v !== null && v !== '') {
                url.searchParams.append(key, String(v));
              }
            });
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
      delete options.params;
    }

    const response = await fetch(url.toString(), {
      cache: this.isServer ? 'no-store' : 'default',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} - ${errorText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Public endpoints (no authentication required)
  
  async getCars(params: SearchCarsParams = {}): Promise<CarsResponse> {
    return this.request<CarsResponse>('/cars', { params });
  }

  async getCar(id: string): Promise<Car> {
    return this.request<Car>(`/cars/${id}`);
  }

  async getFeaturedCars(limit = 10): Promise<Car[]> {
    return this.request<Car[]>('/cars/featured', { params: { limit } });
  }

  async getPopularMakes(limit = 20): Promise<PopularMake[]> {
    return this.request<PopularMake[]>('/cars/popular-makes', { params: { limit } });
  }

  async incrementViewCount(id: string): Promise<void> {
    return this.request<void>(`/cars/${id}/views`, { method: 'POST' });
  }

  // Admin endpoints (for future use)
  async getCarStatistics(): Promise<CarStatistics> {
    return this.request<CarStatistics>('/cars/admin/statistics');
  }
}

// Export singleton instance
export const carsAPI = new CarsAPI();

// Re-export types for convenience
export type { Car, SearchCarsParams, CarsResponse, PopularMake, CarStatistics };