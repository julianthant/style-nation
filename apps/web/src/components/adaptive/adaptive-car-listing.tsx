'use client'

import { useDeviceDetection } from '@/lib/utils/device-detection'
import { MobileCarListing } from '@/components/mobile/cars/mobile-car-listing'
import { DesktopCarListing } from '@/components/desktop/cars/desktop-car-listing'
import { CarFilters, SortOption } from '@/lib/types/car'

interface AdaptiveCarListingProps {
  filters: CarFilters
  sortBy: SortOption
  currentPage: number
  onSortChange: (sort: SortOption) => void
  onPageChange: (page: number) => void
  onFiltersOpen?: () => void
  onSearchOpen?: () => void
  initialData: {
    cars: any[];
    totalCars: number;
    totalPages: number;
    currentPage: number;
    popularMakes: Array<{ make: string; count: number }>;
    success: boolean;
  };
}

export function AdaptiveCarListing({ 
  filters, 
  sortBy,
  currentPage,
  onSortChange,
  onPageChange,
  onFiltersOpen, 
  onSearchOpen,
  initialData
}: AdaptiveCarListingProps) {
  const { device, isHydrated } = useDeviceDetection()

  // Show desktop version during SSR to prevent layout shift
  if (!isHydrated) {
    return (
      <DesktopCarListing 
        filters={filters}
        sortBy={sortBy}
        currentPage={currentPage}
        onSortChange={onSortChange}
        onPageChange={onPageChange}
        initialData={initialData}
      />
    )
  }

  // Use mobile layout for mobile and tablet devices
  const shouldUseMobile = device === 'mobile' || device === 'tablet'

  return shouldUseMobile ? (
    <MobileCarListing 
      filters={filters}
      sortBy={sortBy}
      currentPage={currentPage}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      onFiltersOpen={onFiltersOpen || (() => console.log('Open filters'))}
      onSearchOpen={onSearchOpen || (() => console.log('Open search'))}
      initialData={initialData}
    />
  ) : (
    <DesktopCarListing 
      filters={filters}
      sortBy={sortBy}
      currentPage={currentPage}
      onSortChange={onSortChange}
      onPageChange={onPageChange}
      initialData={initialData}
    />
  )
}