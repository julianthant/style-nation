'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterSidebar } from '@/components/cars/filter-sidebar';
import { AdaptiveCarListing } from '@/components/adaptive/adaptive-car-listing';
import { useDevice } from '@/components/adaptive/device-provider';
import type { CarFilters, SortOption, Car } from '@/lib/types/car';

interface CarsPageClientProps {
  initialFilters: CarFilters & { sortBy: SortOption; page: number };
  initialCarsData: {
    cars: Car[];
    totalCars: number;
    totalPages: number;
    currentPage: number;
    popularMakes: Array<{ make: string; count: number }>;
    success: boolean;
  };
}

export function CarsPageClient({ initialFilters, initialCarsData }: CarsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shouldUseMobileLayout } = useDevice();
  
  const [filters, setFilters] = useState<CarFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: CarFilters, newSortBy?: SortOption, newPage?: number) => {
    const params = new URLSearchParams();
    
    // Add filter params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    // Add sort and page params
    if (newSortBy && newSortBy !== 'newest') {
      params.set('sortBy', newSortBy);
    }
    if (newPage && newPage > 1) {
      params.set('page', String(newPage));
    }
    
    // Update URL without causing a page reload
    const newURL = `/cars${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL);
  }, [router]);

  const handleFiltersChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    updateURL(newFilters, sortBy, 1);
  }, [updateURL, sortBy]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
    updateURL(filters, newSort, 1);
  }, [updateURL, filters]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    updateURL(filters, sortBy, newPage);
  }, [updateURL, filters, sortBy]);

  const handleFiltersOpen = useCallback(() => {
    console.log('Open mobile filters');
    // TODO: Implement mobile filter modal/sheet
  }, []);

  const handleSearchOpen = useCallback(() => {
    console.log('Open mobile search');
    // TODO: Implement mobile search modal
  }, []);

  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters: CarFilters = {};
    let urlSortBy: SortOption = 'newest';
    let urlPage = 1;

    // Parse current URL params
    for (const [key, value] of searchParams.entries()) {
      switch (key) {
        case 'search':
        case 'make':
        case 'model':
          urlFilters[key] = value;
          break;
        case 'minPrice':
        case 'maxPrice':
        case 'minYear':
        case 'maxYear':
          urlFilters[key] = parseInt(value);
          break;
        case 'condition':
        case 'transmission':
        case 'fuelType':
        case 'bodyType':
          urlFilters[key] = [value as any];
          break;
        case 'sortBy':
          urlSortBy = value as SortOption;
          break;
        case 'page':
          urlPage = parseInt(value);
          break;
      }
    }

    setFilters(urlFilters);
    setSortBy(urlSortBy);
    setCurrentPage(urlPage);
  }, [searchParams]);

  return shouldUseMobileLayout ? (
    /* Mobile Layout - Full Width Listing */
    <AdaptiveCarListing 
      filters={filters}
      sortBy={sortBy}
      currentPage={currentPage}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onFiltersOpen={handleFiltersOpen}
      onSearchOpen={handleSearchOpen}
      initialData={initialCarsData}
    />
  ) : (
    /* Desktop Layout - Sidebar + Listing */
    <div className="container mx-auto max-w-[1400px] px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar 
          initialFilters={filters}
          popularMakes={initialCarsData.popularMakes}
          onFiltersChange={handleFiltersChange} 
        />
        <AdaptiveCarListing 
          filters={filters}
          sortBy={sortBy}
          currentPage={currentPage}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          initialData={initialCarsData}
        />
      </div>
    </div>
  );
}