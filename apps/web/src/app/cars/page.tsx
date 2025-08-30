import { Suspense } from 'react'
import { AdaptiveHeader } from '@/components/adaptive/adaptive-header'
import { Footer } from '@/components/layout/footer'
import { CarsPageClient } from '@/components/cars/cars-page-client'
import { carsAPI } from '@/lib/api/cars'
import type { CarFilters, SortOption } from '@/lib/types/car'

interface CarsPageProps {
  searchParams: {
    search?: string
    make?: string
    model?: string
    minPrice?: string
    maxPrice?: string
    minYear?: string
    maxYear?: string
    condition?: string
    transmission?: string
    fuelType?: string
    bodyType?: string
    sortBy?: SortOption
    page?: string
  }
}

// Convert URL search params to API filters
function parseSearchParams(searchParams: CarsPageProps['searchParams']): CarFilters & { sortBy: SortOption; page: number } {
  return {
    search: searchParams.search,
    make: searchParams.make,
    model: searchParams.model,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    minYear: searchParams.minYear ? parseInt(searchParams.minYear) : undefined,
    maxYear: searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined,
    condition: searchParams.condition ? [searchParams.condition as any] : undefined,
    transmission: searchParams.transmission ? [searchParams.transmission as any] : undefined,
    fuelType: searchParams.fuelType ? [searchParams.fuelType as any] : undefined,
    bodyType: searchParams.bodyType ? [searchParams.bodyType as any] : undefined,
    sortBy: (searchParams.sortBy as SortOption) || 'newest',
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  }
}

// Server-side data fetching
async function getCarsData(filters: CarFilters & { sortBy: SortOption; page: number }) {
  try {
    const { sortBy, page, ...searchFilters } = filters
    const carsResponse = await carsAPI.getCars({
      ...searchFilters,
      sortBy,
      page,
      limit: 20,
    })
    
    const popularMakes = await carsAPI.getPopularMakes(20)
    
    return {
      cars: carsResponse.cars,
      totalCars: carsResponse.total,
      totalPages: carsResponse.totalPages,
      currentPage: carsResponse.page,
      popularMakes,
      success: true,
    }
  } catch (error) {
    console.error('Failed to fetch cars data:', error)
    return {
      cars: [],
      totalCars: 0,
      totalPages: 0,
      currentPage: 1,
      popularMakes: [],
      success: false,
    }
  }
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  // Parse search parameters
  const parsedFilters = parseSearchParams(searchParams)
  
  // Fetch cars data server-side
  const carsData = await getCarsData(parsedFilters)

  return (
    <div className="min-h-screen bg-background">
      <AdaptiveHeader variant="default" />
      
      <Suspense fallback={
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex gap-8">
              <div className="w-80 h-96 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }>
        <CarsPageClient 
          initialFilters={parsedFilters}
          initialCarsData={carsData}
        />
      </Suspense>
      
      <Footer />
    </div>
  )
}