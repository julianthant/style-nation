'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'
import { CarFilters, SortOption } from '@/lib/types/car'

interface QuickSearchProps {
  filters: CarFilters
  sortBy: SortOption
  onFiltersChange: (filters: CarFilters) => void
  onSortChange: (sort: SortOption) => void
  onSearch: () => void
  onToggleAdvancedFilters: () => void
  showAdvancedFilters: boolean
  resultsCount?: number
  isLoading?: boolean
}

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: '0-15000', label: 'Under $15,000' },
  { value: '15000-25000', label: '$15,000 - $25,000' },
  { value: '25000-35000', label: '$25,000 - $35,000' },
  { value: '35000-50000', label: '$35,000 - $50,000' },
  { value: '50000-75000', label: '$50,000 - $75,000' },
  { value: '75000-999999', label: '$75,000+' },
]

const YEAR_RANGES = [
  { value: '', label: 'Any Year' },
  { value: '2024-2025', label: '2024+' },
  { value: '2020-2023', label: '2020-2023' },
  { value: '2015-2019', label: '2015-2019' },
  { value: '2010-2014', label: '2010-2014' },
  { value: '2000-2009', label: '2000-2009' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest First' },
  { value: 'year_asc', label: 'Year: Oldest First' },
  { value: 'mileage_asc', label: 'Mileage: Low to High' },
]

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai'
]

export function QuickSearch({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onSearch,
  onToggleAdvancedFilters,
  showAdvancedFilters,
  resultsCount,
  isLoading = false
}: QuickSearchProps) {
  const updateFilters = (key: keyof CarFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handlePriceRangeChange = (value: string) => {
    if (!value) {
      updateFilters('minPrice', undefined)
      updateFilters('maxPrice', undefined)
      return
    }

    const [min, max] = value.split('-').map(Number)
    updateFilters('minPrice', min > 0 ? min : undefined)
    updateFilters('maxPrice', max < 999999 ? max : undefined)
  }

  const handleYearRangeChange = (value: string) => {
    if (!value) {
      updateFilters('minYear', undefined)
      updateFilters('maxYear', undefined)
      return
    }

    const [min, max] = value.split('-').map(Number)
    updateFilters('minYear', min)
    updateFilters('maxYear', max)
  }

  const getCurrentPriceRange = () => {
    const { minPrice, maxPrice } = filters
    if (!minPrice && !maxPrice) return ''
    
    return PRICE_RANGES.find(range => {
      if (!range.value) return false
      const [min, max] = range.value.split('-').map(Number)
      return (
        (minPrice || 0) === min && 
        (maxPrice === undefined ? max >= 999999 : maxPrice === max)
      )
    })?.value || ''
  }

  const getCurrentYearRange = () => {
    const { minYear, maxYear } = filters
    if (!minYear && !maxYear) return ''
    
    return YEAR_RANGES.find(range => {
      if (!range.value) return false
      const [min, max] = range.value.split('-').map(Number)
      return minYear === min && maxYear === max
    })?.value || ''
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.make) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.minYear || filters.maxYear) count++
    if (filters.maxMileage) count++
    if (filters.condition?.length) count += filters.condition.length
    if (filters.bodyType?.length) count += filters.bodyType.length
    if (filters.transmission?.length) count += filters.transmission.length
    if (filters.fuelType?.length) count += filters.fuelType.length
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-6">
      {/* Main Search Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or keywords..."
            value={filters.search || ''}
            onChange={(e) => updateFilters('search', e.target.value || undefined)}
            className="pl-10 h-12"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch()
              }
            }}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3">
          {/* Make */}
          <Select value={filters.make || ''} onValueChange={(value) => updateFilters('make', value || undefined)}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue placeholder="Any Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Make</SelectItem>
              {POPULAR_MAKES.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={getCurrentPriceRange()} onValueChange={handlePriceRangeChange}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Range */}
          <Select value={getCurrentYearRange()} onValueChange={handleYearRangeChange}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue placeholder="Any Year" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Button */}
          <Button 
            onClick={onSearch}
            size="lg" 
            disabled={isLoading}
            className="px-8 h-12"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-l-transparent mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Results Info and Active Filters */}
        <div className="flex items-center gap-4">
          {resultsCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              {resultsCount.toLocaleString()} cars found
            </span>
          )}

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-6">
                {activeFiltersCount} filters active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Advanced Filters Toggle */}
          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={onToggleAdvancedFilters}
            className="h-9"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant={showAdvancedFilters ? "secondary" : "default"} className="ml-2 h-5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[200px] h-9">
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
    </div>
  )
}