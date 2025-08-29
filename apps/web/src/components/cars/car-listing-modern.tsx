'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { getCarPlaceholderImage, formatPrice, formatMileage } from '@/lib/utils/placeholder'
import { carsAPI, type SearchCarsParams, type CarsResponse } from '@/lib/api/cars'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuickSearch } from './quick-search'
import { AdvancedFilters } from './advanced-filters'
import { SearchResults } from './search-results'

interface CarListingProps {
  filters: CarFilters
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  onFiltersChange?: (filters: CarFilters) => void
  onResetFilters?: () => void
}

const SORT_OPTIONS: SortConfig[] = [
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'year_desc', label: 'Year (Newest First)' },
  { value: 'year_asc', label: 'Year (Oldest First)' },
  { value: 'mileage_asc', label: 'Mileage (Low to High)' },
  { value: 'newest', label: 'Recently Listed' },
]

export function CarListingModern({ 
  filters, 
  sortBy, 
  onSortChange, 
  onFiltersChange,
  onResetFilters 
}: CarListingProps) {
  const router = useRouter()
  const [carsData, setCarsData] = useState<CarsResponse>({
    cars: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [popularMakes, setPopularMakes] = useState<string[]>([])
  const carsPerPage = 20

  // Convert frontend filters to API params
  const buildSearchParams = useCallback((): SearchCarsParams => {
    return {
      search: filters.search,
      make: filters.make,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minYear: filters.minYear,
      maxYear: filters.maxYear,
      maxMileage: filters.maxMileage,
      condition: filters.condition,
      transmission: filters.transmission,
      fuelType: filters.fuelType,
      bodyType: filters.bodyType,
      sortBy: sortBy,
      page: currentPage,
      limit: carsPerPage,
    }
  }, [filters, sortBy, currentPage])

  // Fetch popular makes
  const fetchPopularMakes = useCallback(async () => {
    try {
      const makes = await carsAPI.getPopularMakes(15)
      setPopularMakes(makes.map(make => make.make))
    } catch (err) {
      console.warn('Failed to fetch popular makes:', err)
      setPopularMakes(['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'])
    }
  }, [])

  // Fetch cars from API
  const fetchCars = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const searchParams = buildSearchParams()
      const data = await carsAPI.getCars(searchParams)
      setCarsData(data)
    } catch (err) {
      console.error('Error fetching cars:', err)
      setError('Failed to load cars. Please try again.')
      // Fallback to empty state
      setCarsData({
        cars: [],
        total: 0,
        page: currentPage,
        limit: carsPerPage,
        totalPages: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [buildSearchParams])

  // Initial load
  useEffect(() => {
    fetchPopularMakes()
    fetchCars()
  }, [fetchPopularMakes, fetchCars])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy])

  const handleVehicleClick = useCallback(async (id: string) => {
    // Increment view count
    try {
      await carsAPI.incrementViewCount(id)
    } catch (err) {
      console.warn('Failed to increment view count:', err)
    }
    
    // Navigate to car detail page
    router.push(`/cars/${id}`)
  }, [router])

  const handleBookmark = useCallback((id: string) => {
    console.log('Bookmark clicked:', id)
    // TODO: Implement bookmark functionality
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = useCallback(() => {
    fetchCars()
  }, [fetchCars])

  const handleFiltersChange = useCallback((newFilters: CarFilters) => {
    onFiltersChange?.(newFilters)
  }, [onFiltersChange])

  const handleResetFilters = useCallback(() => {
    onResetFilters?.()
  }, [onResetFilters])

  // Convert Car to VehicleCard props
  const convertToVehicleCardProps = (car: Car) => {
    const primaryImage = car.images?.find(img => img.isPrimary) || car.images?.[0]
    
    return {
      id: car.id,
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description,
      image: primaryImage?.url || getCarPlaceholderImage(car),
      price: formatPrice(Number(car.price)),
      mileage: formatMileage(car.mileage),
      fuelType: car.fuelType.replace('_', ' '),
      transmission: car.transmissionType.replace('_', ' '),
      year: car.year.toString(),
      badge: car.condition === 'NEW' ? { text: 'New', color: 'green' as const } :
             car.condition === 'CERTIFIED_PREOWNED' ? { text: 'Certified', color: 'blue' as const } : undefined,
      onViewDetails: handleVehicleClick,
      onBookmark: handleBookmark,
    }
  }

  if (error) {
    return (
      <main className="flex-1" role="main" aria-label="Car listings">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCars}
              className="ml-4"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="flex-1" role="main" aria-label="Car listings">
      {/* Quick Search */}
      <QuickSearch
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={handleFiltersChange}
        onSortChange={onSortChange}
        onSearch={handleSearch}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        showAdvancedFilters={showAdvancedFilters}
        resultsCount={carsData.total}
        isLoading={isLoading}
      />

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleSearch}
          onResetFilters={handleResetFilters}
          popularMakes={popularMakes}
          isLoading={isLoading}
        />
      )}

      {/* Search Results Header */}
      <SearchResults
        cars={carsData.cars}
        totalResults={carsData.total}
        currentPage={currentPage}
        totalPages={carsData.totalPages}
        sortBy={sortBy}
        onSortChange={onSortChange}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        view={viewMode}
        onViewChange={setViewMode}
      />

      {/* Car Listings */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'cars-grid' : 'space-y-4'}>
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
      ) : carsData.cars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-xl">
            No cars found matching your criteria.
          </p>
          <p className="text-muted-foreground mt-2 text-base">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'cars-grid' : 'space-y-4'} role="grid" aria-labelledby="results-heading">
          {carsData.cars.map((car) => (
            <div key={car.id} className="hover-lift" role="gridcell">
              <VehicleCard
                {...convertToVehicleCardProps(car)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && carsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1 || isLoading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, carsData.totalPages) }, (_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : 
                            currentPage >= carsData.totalPages - 2 ? carsData.totalPages - 4 + i :
                            currentPage - 2 + i
            
            if (pageNum < 1 || pageNum > carsData.totalPages) return null
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === carsData.totalPages || isLoading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  )
}