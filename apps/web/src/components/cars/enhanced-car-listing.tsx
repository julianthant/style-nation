'use client'

import { useState, useCallback } from 'react'
import { CarFilters, SortOption } from '@/lib/types/car'
import { CarListingModern } from './car-listing-modern'

interface EnhancedCarListingProps {
  initialFilters?: CarFilters
  initialSort?: SortOption
}

const DEFAULT_FILTERS: CarFilters = {
  search: undefined,
  make: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minYear: undefined,
  maxYear: undefined,
  maxMileage: undefined,
  condition: undefined,
  transmission: undefined,
  fuelType: undefined,
  bodyType: undefined,
}

export function EnhancedCarListing({ 
  initialFilters = DEFAULT_FILTERS,
  initialSort = 'newest'
}: EnhancedCarListingProps) {
  const [filters, setFilters] = useState<CarFilters>(initialFilters)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)

  const handleFiltersChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EnhancedCarListingInner
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  )
}

interface EnhancedCarListingInnerProps {
  filters: CarFilters
  sortBy: SortOption
  onFiltersChange: (filters: CarFilters) => void
  onSortChange: (sort: SortOption) => void
  onResetFilters: () => void
}

function EnhancedCarListingInner({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onResetFilters
}: EnhancedCarListingInnerProps) {
  return (
    <CarListingModern
      filters={filters}
      sortBy={sortBy}
      onSortChange={onSortChange}
      onFiltersChange={onFiltersChange}
      onResetFilters={onResetFilters}
    />
  )
}