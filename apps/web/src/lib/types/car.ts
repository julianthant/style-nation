// TypeScript interfaces matching Prisma schema for Style Nation

export type Role = 'USER' | 'ADMIN'

export type Condition = 'NEW' | 'USED' | 'CERTIFIED_PREOWNED'

export type ListingStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE'

export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DUAL_CLUTCH'

export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'PLUG_IN_HYBRID'

export type BodyType = 'SEDAN' | 'SUV' | 'TRUCK' | 'COUPE' | 'CONVERTIBLE' | 'WAGON' | 'VAN' | 'HATCHBACK'

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

export interface CarImage {
  id: string
  carId: string
  url: string
  isPrimary: boolean
  order: number
  createdAt: Date
}

export interface User {
  id: string
  email: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Profile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  vin: string
  condition: Condition
  transmissionType: Transmission
  fuelType: FuelType
  bodyType: BodyType
  exteriorColor: string
  interiorColor: string
  engineSize?: string
  features: string[]
  description: string
  images: CarImage[]
  status: ListingStatus
  featuredUntil?: Date
  facebookPostId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  creator: User
  viewCount: number
}

export interface Inquiry {
  id: string
  carId: string
  car: Car
  userId?: string
  user?: User
  name: string
  email: string
  phone?: string
  message: string
  status: InquiryStatus
  createdAt: Date
  updatedAt: Date
}

// Frontend-specific types for filtering and display
export interface CarFilters {
  search?: string
  make?: string
  bodyType?: BodyType[]
  condition?: Condition[]
  transmission?: Transmission[]
  fuelType?: FuelType[]
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  minMileage?: number
  maxMileage?: number
  status?: ListingStatus
}

export interface CarListProps {
  cars: Car[]
  loading?: boolean
  error?: string
  onCarClick?: (car: Car) => void
  showFilters?: boolean
}

export interface CarCardProps {
  car: Car
  onClick?: (car: Car) => void
  showQuickView?: boolean
  featured?: boolean
}

// Sort options for car listings
export type SortOption = 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'mileage_asc' | 'mileage_desc' | 'newest' | 'oldest'

export interface SortConfig {
  value: SortOption
  label: string
}