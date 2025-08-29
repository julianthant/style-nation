'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Filter,
  X,
  ChevronDown,
  Search,
  RotateCcw,
  Car,
  DollarSign,
  Calendar,
  Gauge
} from 'lucide-react'
import { CarFilters } from '@/lib/types/car'
import { formatPrice } from '@/lib/utils/placeholder'

interface AdvancedFiltersProps {
  filters: CarFilters
  onFiltersChange: (filters: CarFilters) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  popularMakes?: string[]
  isLoading?: boolean
}

const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'VAN', label: 'Van' },
  { value: 'HATCHBACK', label: 'Hatchback' },
]

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'CERTIFIED_PREOWNED', label: 'Certified Pre-Owned' },
]

const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DUAL_CLUTCH', label: 'Dual Clutch' },
]

const FUEL_TYPES = [
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'PLUG_IN_HYBRID', label: 'Plug-in Hybrid' },
]

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai'
]

const MILEAGE_OPTIONS = [
  { value: 10000, label: 'Under 10K miles' },
  { value: 25000, label: 'Under 25K miles' },
  { value: 50000, label: 'Under 50K miles' },
  { value: 75000, label: 'Under 75K miles' },
  { value: 100000, label: 'Under 100K miles' },
]

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  onResetFilters,
  popularMakes = POPULAR_MAKES,
  isLoading = false
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 150000
  ])
  const [yearRange, setYearRange] = useState<[number, number]>([
    filters.minYear || 2000,
    filters.maxYear || new Date().getFullYear()
  ])

  useEffect(() => {
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 150000])
    setYearRange([filters.minYear || 2000, filters.maxYear || new Date().getFullYear()])
  }, [filters])

  const updateFilters = (key: keyof CarFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const updateArrayFilter = (key: keyof CarFilters, value: string, checked: boolean) => {
    const currentArray = (filters[key] as string[]) || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    updateFilters(key, newArray.length > 0 ? newArray : undefined)
  }

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    updateFilters('minPrice', value[0] > 0 ? value[0] : undefined)
    updateFilters('maxPrice', value[1] < 150000 ? value[1] : undefined)
  }

  const handleYearRangeChange = (value: [number, number]) => {
    setYearRange(value)
    updateFilters('minYear', value[0] > 2000 ? value[0] : undefined)
    updateFilters('maxYear', value[1] < new Date().getFullYear() ? value[1] : undefined)
  }

  const getActiveFiltersCount = () => {
    let count = 0
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
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5" />
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onResetFilters()
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Label>
                <Input
                  placeholder="Make, model, or keywords..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters('search', e.target.value || undefined)}
                  className="h-10"
                />
              </div>

              {/* Make */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Make
                </Label>
                <Select value={filters.make || ''} onValueChange={(value) => updateFilters('make', value || undefined)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All makes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All makes</SelectItem>
                    {popularMakes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Mileage */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Max Mileage
                </Label>
                <Select 
                  value={filters.maxMileage?.toString() || ''} 
                  onValueChange={(value) => updateFilters('maxMileage', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Any mileage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any mileage</SelectItem>
                    {MILEAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </Label>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={150000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Year Range */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Year Range
              </Label>
              <div className="space-y-4">
                <Slider
                  value={yearRange}
                  onValueChange={handleYearRangeChange}
                  max={new Date().getFullYear()}
                  min={2000}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{yearRange[0]}</span>
                  <span>{yearRange[1]}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Condition */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Condition</Label>
                <div className="space-y-3">
                  {CONDITIONS.map((condition) => (
                    <div key={condition.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition.value}`}
                        checked={filters.condition?.includes(condition.value) || false}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('condition', condition.value, !!checked)
                        }
                      />
                      <Label 
                        htmlFor={`condition-${condition.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {condition.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Body Type</Label>
                <div className="space-y-3">
                  {BODY_TYPES.map((bodyType) => (
                    <div key={bodyType.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`bodyType-${bodyType.value}`}
                        checked={filters.bodyType?.includes(bodyType.value) || false}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('bodyType', bodyType.value, !!checked)
                        }
                      />
                      <Label 
                        htmlFor={`bodyType-${bodyType.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {bodyType.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Transmission</Label>
                <div className="space-y-3">
                  {TRANSMISSIONS.map((transmission) => (
                    <div key={transmission.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`transmission-${transmission.value}`}
                        checked={filters.transmission?.includes(transmission.value) || false}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('transmission', transmission.value, !!checked)
                        }
                      />
                      <Label 
                        htmlFor={`transmission-${transmission.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {transmission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Fuel Type</Label>
                <div className="space-y-3">
                  {FUEL_TYPES.map((fuelType) => (
                    <div key={fuelType.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`fuelType-${fuelType.value}`}
                        checked={filters.fuelType?.includes(fuelType.value) || false}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('fuelType', fuelType.value, !!checked)
                        }
                      />
                      <Label 
                        htmlFor={`fuelType-${fuelType.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {fuelType.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={onApplyFilters}
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-l-transparent mr-2" />
                    Applying Filters...
                  </>
                ) : (
                  <>
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}