'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DesktopCarCard } from './desktop-car-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { CarFilters, SortOption, Car, SortConfig } from '@/lib/types/car'
import { getCarPlaceholderImage, formatPrice, formatMileage, formatCondition, formatTransmission, formatFuelType } from '@/lib/utils/placeholder'

interface DesktopCarListingProps {
  filters: CarFilters
  sortBy: SortOption
  currentPage: number
  onSortChange: (sort: SortOption) => void
  onPageChange: (page: number) => void
  initialData: {
    cars: Car[];
    totalCars: number;
    totalPages: number;
    currentPage: number;
    popularMakes: Array<{ make: string; count: number }>;
    success: boolean;
  };
}

const SORT_OPTIONS: SortConfig[] = [
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'year_desc', label: 'Year (Newest First)' },
  { value: 'year_asc', label: 'Year (Oldest First)' },
  { value: 'mileage_asc', label: 'Mileage (Low to High)' },
  { value: 'newest', label: 'Recently Listed' },
]

// Mock data for demonstration
const MOCK_CARS: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 28500,
    mileage: 15000,
    vin: '1234567890',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    exteriorColor: 'Silver',
    interiorColor: 'Black',
    engineSize: '2.5L',
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay'],
    description: 'Excellent condition Toyota Camry with low mileage and premium features',
    images: [{
      id: '1',
      carId: '1',
      url: '/images/cars/toyota-camry.jpg',
      isPrimary: true,
      order: 1,
      createdAt: new Date()
    }],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 45
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 24000,
    mileage: 28000,
    vin: '0987654321',
    condition: 'USED',
    transmissionType: 'MANUAL',
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    exteriorColor: 'Blue',
    interiorColor: 'Gray',
    engineSize: '2.0L',
    features: ['Manual Transmission', 'Fuel Efficient', 'Sporty Design'],
    description: 'Well-maintained Honda Civic with manual transmission for driving enthusiasts',
    images: [{
      id: '2',
      carId: '2',
      url: '/images/cars/honda-civic.jpg',
      isPrimary: true,
      order: 1,
      createdAt: new Date()
    }],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 32
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    price: 42000,
    mileage: 5000,
    vin: '1122334455',
    condition: 'NEW',
    transmissionType: 'AUTOMATIC',
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    exteriorColor: 'White',
    interiorColor: 'Black',
    features: ['Autopilot', 'Supercharging', 'Over-the-Air Updates'],
    description: 'Brand new Tesla Model 3 with latest autopilot features and supercharging capability',
    images: [{
      id: '3',
      carId: '3',
      url: '/images/cars/tesla-model3.jpg',
      isPrimary: true,
      order: 1,
      createdAt: new Date()
    }],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 78
  },
  {
    id: '4',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    price: 65000,
    mileage: 12000,
    vin: '5544332211',
    condition: 'CERTIFIED_PREOWNED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    exteriorColor: 'Black',
    interiorColor: 'Tan',
    engineSize: '3.0L',
    features: ['AWD', 'Premium Sound', 'Panoramic Sunroof'],
    description: 'Certified pre-owned BMW X5 with premium features and all-wheel drive capability',
    images: [{
      id: '4',
      carId: '4',
      url: '/images/cars/bmw-x5.jpg',
      isPrimary: true,
      order: 1,
      createdAt: new Date()
    }],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 56
  }
]

type ViewMode = 'grid' | 'list'

export function DesktopCarListing({ filters, sortBy, currentPage, onSortChange, onPageChange, initialData }: DesktopCarListingProps) {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>(initialData?.cars || [])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Use API data directly instead of client-side pagination
  const totalCars = initialData?.totalCars || 0
  const totalPages = initialData?.totalPages || 1

  // Use the cars directly from API (server-side filtered/sorted)
  const displayCars = cars

  const handleVehicleClick = useCallback((id: string) => {
    router.push(`/cars/${id}`)
  }, [router])

  const handleBookmark = useCallback((id: string) => {
    console.log('Bookmark clicked:', id)
  }, [])

  // Convert Car to DesktopCarCard props
  const convertToDesktopCarCardProps = (car: Car) => ({
    id: car.id,
    title: `${car.year} ${car.make} ${car.model}`,
    description: car.description,
    image: car.images[0]?.url || getCarPlaceholderImage(car),
    price: formatPrice(car.price),
    year: car.year,
    mileage: formatMileage(car.mileage),
    fuelType: formatFuelType(car.fuelType),
    transmission: formatTransmission(car.transmissionType),
    badge: car.condition === 'NEW' ? { text: 'New', color: 'green' as const } :
           car.condition === 'CERTIFIED_PREOWNED' ? { text: 'Certified', color: 'blue' as const } : undefined,
    onViewDetails: handleVehicleClick,
    onBookmark: handleBookmark,
  })

  return (
    <main className="flex-1" role="main" aria-label="Car listings">
      {/* Results Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" id="results-heading">
            Available Cars
          </h1>
          <p className="text-muted-foreground mt-1" aria-live="polite">
            {isLoading ? 'Loading...' : `Showing ${displayCars.length} of ${totalCars} results`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[220px]" aria-label="Sort cars by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Car Listings */}
      {isLoading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
              <div className="h-52 bg-muted" />
              <div className="p-5">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded" />
                    ))}
                  </div>
                  <div className="h-12 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayCars.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground text-xl mb-4">
              No cars found matching your criteria.
            </p>
            <p className="text-muted-foreground text-base mb-6">
              Try adjusting your filters to see more results.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                // Reset filters
                console.log('Reset filters')
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`} 
          role="grid" 
          aria-labelledby="results-heading"
        >
          {displayCars.map((car) => (
            <div key={car.id} role="gridcell">
              <DesktopCarCard
                car={convertToDesktopCarCardProps(car)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {displayCars.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className="px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : 
                            currentPage >= totalPages - 2 ? totalPages - 4 + i :
                            currentPage - 2 + i
            
            if (pageNum < 1 || pageNum > totalPages) return null
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="min-w-10"
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className="px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </main>
  )
}