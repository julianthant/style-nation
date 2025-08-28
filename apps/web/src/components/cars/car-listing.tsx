'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CarFilters, SortOption, Car, SortConfig } from '@/lib/types/car'
import { getCarPlaceholderImage, formatPrice, formatMileage, formatCondition, formatTransmission, formatFuelType } from '@/lib/utils/placeholder'

interface CarListingProps {
  filters: CarFilters
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
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
    description: 'Excellent condition Toyota Camry with low mileage',
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
    description: 'Well-maintained Honda Civic with manual transmission',
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
    description: 'Brand new Tesla Model 3 with latest features',
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
    description: 'Certified pre-owned BMW X5 with premium features',
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

export function CarListing({ filters, sortBy, onSortChange }: CarListingProps) {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>(MOCK_CARS)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const carsPerPage = 12

  // Filter and sort cars with memoization to prevent unnecessary recalculations
  const filteredAndSortedCars = useMemo(() => {
    // Filter cars based on filters
    const filtered = cars.filter(car => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!car.make.toLowerCase().includes(searchTerm) && 
            !car.model.toLowerCase().includes(searchTerm) &&
            !car.description.toLowerCase().includes(searchTerm)) {
          return false
        }
      }

      if (filters.minPrice && car.price < filters.minPrice) return false
      if (filters.maxPrice && car.price > filters.maxPrice) return false
      if (filters.make && car.make !== filters.make) return false
      if (filters.minYear && car.year < filters.minYear) return false
      if (filters.maxYear && car.year > filters.maxYear) return false
      if (filters.maxMileage && car.mileage && car.mileage > filters.maxMileage) return false
      
      if (filters.bodyType && filters.bodyType.length > 0 && !filters.bodyType.includes(car.bodyType)) return false
      if (filters.condition && filters.condition.length > 0 && !filters.condition.includes(car.condition)) return false
      if (filters.transmission && filters.transmission.length > 0 && !filters.transmission.includes(car.transmissionType)) return false
      if (filters.fuelType && filters.fuelType.length > 0 && !filters.fuelType.includes(car.fuelType)) return false

      return true
    })

    // Sort cars
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'year_desc':
          return b.year - a.year
        case 'year_asc':
          return a.year - b.year
        case 'mileage_asc':
          return (a.mileage || 0) - (b.mileage || 0)
        case 'mileage_desc':
          return (b.mileage || 0) - (a.mileage || 0)
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })
  }, [cars, filters, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCars.length / carsPerPage)
  const startIndex = (currentPage - 1) * carsPerPage
  const paginatedCars = filteredAndSortedCars.slice(startIndex, startIndex + carsPerPage)

  const handleVehicleClick = useCallback((id: string) => {
    router.push(`/cars/${id}`)
  }, [router])

  const handleBookmark = useCallback((id: string) => {
    console.log('Bookmark clicked:', id)
    // TODO: Implement bookmark functionality
  }, [])

  // Convert Car to VehicleCard props
  const convertToVehicleCardProps = (car: Car) => ({
    id: car.id,
    title: `${car.year} ${car.make} ${car.model}`,
    description: car.description,
    image: car.images[0]?.url || getCarPlaceholderImage(car),
    price: formatPrice(car.price),
    mileage: formatMileage(car.mileage),
    fuelType: formatFuelType(car.fuelType),
    transmission: formatTransmission(car.transmissionType),
    year: car.year.toString(),
    badge: car.condition === 'NEW' ? { text: 'New', color: 'green' as const } :
           car.condition === 'CERTIFIED_PREOWNED' ? { text: 'Certified', color: 'blue' as const } : undefined,
    onViewDetails: handleVehicleClick,
    onBookmark: handleBookmark,
  })

  return (
    <main className="flex-1" role="main" aria-label="Car listings">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" id="results-heading">
            Available Cars
          </h1>
          <p className="text-muted-foreground mt-1" aria-live="polite">
            {isLoading ? 'Loading...' : `Showing ${paginatedCars.length} of ${filteredAndSortedCars.length} results`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
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
        <div className="cars-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
              <div className="h-[219px] bg-muted" />
              <div className="p-8 pb-5">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded w-32" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded" />
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-10 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-xl">
            No cars found matching your criteria.
          </p>
          <p className="text-muted-foreground mt-2 text-base">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <div className="cars-grid" role="grid" aria-labelledby="results-heading">
          {paginatedCars.map((car) => (
            <div key={car.id} className="hover-lift" role="gridcell">
              <VehicleCard
                {...convertToVehicleCardProps(car)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedCars.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
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
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  )
}