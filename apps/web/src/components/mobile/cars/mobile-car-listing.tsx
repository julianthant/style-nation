'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MobileCarCard } from './mobile-car-card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, Search, ArrowUpDown } from 'lucide-react'
import { CarFilters, SortOption, Car, SortConfig } from '@/lib/types/car'
import { getCarPlaceholderImage, formatPrice, formatMileage, formatCondition, formatTransmission, formatFuelType } from '@/lib/utils/placeholder'

interface MobileCarListingProps {
  filters: CarFilters
  sortBy: SortOption
  currentPage: number
  onSortChange: (sort: SortOption) => void
  onPageChange: (page: number) => void
  onFiltersOpen: () => void
  onSearchOpen: () => void
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
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Newest First' },
  { value: 'year_asc', label: 'Oldest First' },
  { value: 'mileage_asc', label: 'Low Mileage' },
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
  }
]

export function MobileCarListing({ 
  filters, 
  sortBy, 
  onSortChange, 
  onFiltersOpen, 
  onSearchOpen 
}: MobileCarListingProps) {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>(MOCK_CARS)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const carsPerPage = 10

  // Filter and sort cars with memoization
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
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  }, [])

  // Convert Car to MobileCarCard props
  const convertToMobileCarCardProps = (car: Car) => ({
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

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-40 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Available Cars</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${filteredAndSortedCars.length} cars found`}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onSearchOpen}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onFiltersOpen}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-32" size="sm">
              <ArrowUpDown className="w-4 h-4" />
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
      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded" />
                    </div>
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-12 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedCars.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No cars found matching your criteria.
            </p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters to see more results.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                // Reset filters
                console.log('Reset filters')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Car Cards */}
            {paginatedCars.map((car) => (
              <MobileCarCard
                key={car.id}
                car={convertToMobileCarCardProps(car)}
              />
            ))}

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  className="min-w-32"
                >
                  Load More ({totalPages - currentPage} pages left)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}