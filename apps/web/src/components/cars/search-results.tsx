'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LayoutGrid, 
  List, 
  MapPin, 
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Star,
  Share2,
  Heart,
  Car,
  Calendar
} from 'lucide-react'
import { Car as CarType, SortOption } from '@/lib/types/car'

interface SearchResultsProps {
  cars: CarType[]
  totalResults: number
  currentPage: number
  totalPages: number
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  onPageChange: (page: number) => void
  isLoading?: boolean
  view?: 'grid' | 'list'
  onViewChange?: (view: 'grid' | 'list') => void
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: Clock },
  { value: 'price_asc', label: 'Price: Low to High', icon: TrendingUp },
  { value: 'price_desc', label: 'Price: High to Low', icon: TrendingUp },
  { value: 'year_desc', label: 'Year: Newest First', icon: Calendar },
  { value: 'year_asc', label: 'Year: Oldest First', icon: Calendar },
  { value: 'mileage_asc', label: 'Mileage: Low to High', icon: Car },
]

const RESULTS_PER_PAGE_OPTIONS = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 36, label: '36 per page' },
  { value: 48, label: '48 per page' },
]

export function SearchResults({
  cars,
  totalResults,
  currentPage,
  totalPages,
  sortBy,
  onSortChange,
  onPageChange,
  isLoading = false,
  view = 'grid',
  onViewChange
}: SearchResultsProps) {
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  const [resultsPerPage, setResultsPerPage] = useState(24)

  const startResult = ((currentPage - 1) * resultsPerPage) + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalResults)

  const handleSaveSearch = () => {
    // TODO: Implement save search functionality
    console.log('Save search clicked')
  }

  const handleShareResults = () => {
    // TODO: Implement share results functionality
    if (navigator.share) {
      navigator.share({
        title: `${totalResults} Cars Found`,
        text: `Check out these ${totalResults} cars I found`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Could show toast notification here
    }
  }

  const getResultsText = () => {
    if (totalResults === 0) return 'No results found'
    if (totalResults === 1) return '1 car found'
    return `${totalResults.toLocaleString()} cars found`
  }

  const getRangeText = () => {
    if (totalResults === 0) return ''
    if (totalResults <= resultsPerPage) return ''
    return ` • Showing ${startResult}-${endResult}`
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Results Count and Info */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getResultsText()}
              </h2>
              <p className="text-muted-foreground text-sm">
                Search results{getRangeText()}
              </p>
            </div>
            
            {totalResults > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSearch}
                  className="h-8"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Save Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareResults}
                  className="h-8"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          {totalResults > 0 && (
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              {onViewChange && (
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={view === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('grid')}
                    className="h-8 px-3"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange('list')}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Results Per Page */}
              <Select 
                value={resultsPerPage.toString()} 
                onValueChange={(value) => setResultsPerPage(parseInt(value))}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 min-w-[180px] justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span className="text-sm">
                        {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort by'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => onSortChange(option.value as SortOption)}
                      className={sortBy === option.value ? 'bg-muted' : ''}
                    >
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {totalResults > 0 && !isLoading && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Avg price: ${Math.round(cars.reduce((sum, car) => sum + car.price, 0) / cars.length).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                <span>Avg mileage: {Math.round(cars.reduce((sum, car) => sum + (car.mileage || 0), 0) / cars.length).toLocaleString()} miles</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{cars.filter(car => car.condition === 'NEW').length} new cars</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popular Filters Suggestions */}
      {totalResults > 50 && !isLoading && (
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Narrow your search</h3>
            <Badge variant="secondary" className="text-xs">
              Popular filters
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Under $25,000
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              2020 or newer
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Under 50k miles
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              SUV only
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Automatic transmission
            </Button>
          </div>
        </div>
      )}

      {/* Loading States */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-border animate-pulse">
              <div className="p-6">
                <div className="flex gap-6">
                  <div className="w-64 h-48 bg-muted rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-8 bg-muted rounded w-1/2" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded" />
                    </div>
                    <div className="h-10 bg-muted rounded w-32" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {totalResults === 0 && !isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No cars found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any cars matching your search criteria. 
                Try adjusting your filters or search terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">
                  Clear all filters
                </Button>
                <Button>
                  Browse all cars
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}