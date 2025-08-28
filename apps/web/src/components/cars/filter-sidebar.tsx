'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
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
import { CarFilters, BodyType, Condition, Transmission, FuelType } from '@/lib/types/car'

interface FilterSidebarProps {
  onFiltersChange: (filters: CarFilters) => void
}

const BODY_TYPES: BodyType[] = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'HATCHBACK']
const CONDITIONS: Condition[] = ['NEW', 'USED', 'CERTIFIED_PREOWNED']
const TRANSMISSIONS: Transmission[] = ['MANUAL', 'AUTOMATIC', 'CVT', 'DUAL_CLUTCH']
const FUEL_TYPES: FuelType[] = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID']

const MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai']

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [make, setMake] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [maxMileage, setMaxMileage] = useState('')
  const [bodyType, setBodyType] = useState<string>('')
  const [condition, setCondition] = useState<string>('')
  const [transmission, setTransmission] = useState<string>('')
  const [fuelType, setFuelType] = useState<string>('')

  const buildFilters = useCallback((): CarFilters => {
    return {
      search: search || undefined,
      minPrice: minPrice && minPrice !== '0' ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice && maxPrice !== '0' ? parseInt(maxPrice) : undefined,
      make: make && make !== 'all' ? make : undefined,
      minYear: minYear && minYear !== '0' ? parseInt(minYear) : undefined,
      maxYear: maxYear && maxYear !== '0' ? parseInt(maxYear) : undefined,
      maxMileage: maxMileage && maxMileage !== '0' ? parseInt(maxMileage) : undefined,
      bodyType: bodyType && bodyType !== 'all' ? [bodyType as BodyType] : undefined,
      condition: condition && condition !== 'all' ? [condition as Condition] : undefined,
      transmission: transmission && transmission !== 'all' ? [transmission as Transmission] : undefined,
      fuelType: fuelType && fuelType !== 'all' ? [fuelType as FuelType] : undefined,
    }
  }, [search, minPrice, maxPrice, make, minYear, maxYear, maxMileage, bodyType, condition, transmission, fuelType])

  useEffect(() => {
    const filters = buildFilters()
    onFiltersChange(filters)
  }, [buildFilters, onFiltersChange])

  const clearFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setMake('')
    setMinYear('')
    setMaxYear('')
    setMaxMileage('')
    setBodyType('')
    setCondition('')
    setTransmission('')
    setFuelType('')
  }

  return (
    <aside className="w-full lg:w-80 space-y-6 filter-sidebar" role="complementary" aria-labelledby="filter-heading">
      <div className="bg-card rounded-2xl p-6 space-y-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground" id="filter-heading">
            Find Your Perfect Car
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Make, model, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex gap-2">
            <Select value={minPrice} onValueChange={setMinPrice}>
              <SelectTrigger>
                <SelectValue placeholder="Min Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Min Price</SelectItem>
                <SelectItem value="5000">$5,000</SelectItem>
                <SelectItem value="10000">$10,000</SelectItem>
                <SelectItem value="15000">$15,000</SelectItem>
                <SelectItem value="20000">$20,000</SelectItem>
                <SelectItem value="30000">$30,000</SelectItem>
                <SelectItem value="50000">$50,000</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={maxPrice} onValueChange={setMaxPrice}>
              <SelectTrigger>
                <SelectValue placeholder="Max Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Max Price</SelectItem>
                <SelectItem value="20000">$20,000</SelectItem>
                <SelectItem value="30000">$30,000</SelectItem>
                <SelectItem value="50000">$50,000</SelectItem>
                <SelectItem value="75000">$75,000</SelectItem>
                <SelectItem value="100000">$100,000</SelectItem>
                <SelectItem value="150000">$150,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Make</Label>
          <Select value={make} onValueChange={setMake}>
            <SelectTrigger>
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {MAKES.map((makeName) => (
                <SelectItem key={makeName} value={makeName}>
                  {makeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Year</Label>
          <div className="flex gap-2">
            <Select value={minYear} onValueChange={setMinYear}>
              <SelectTrigger>
                <SelectValue placeholder="Min Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Min Year</SelectItem>
                <SelectItem value="2018">2018</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={maxYear} onValueChange={setMaxYear}>
              <SelectTrigger>
                <SelectValue placeholder="Max Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Max Year</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mileage */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Maximum Mileage</Label>
          <Select value={maxMileage} onValueChange={setMaxMileage}>
            <SelectTrigger>
              <SelectValue placeholder="Any Mileage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Mileage</SelectItem>
              <SelectItem value="10000">Under 10,000 miles</SelectItem>
              <SelectItem value="25000">Under 25,000 miles</SelectItem>
              <SelectItem value="50000">Under 50,000 miles</SelectItem>
              <SelectItem value="75000">Under 75,000 miles</SelectItem>
              <SelectItem value="100000">Under 100,000 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Body Type</Label>
          <Select value={bodyType} onValueChange={setBodyType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {BODY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {CONDITIONS.map((cond) => (
                <SelectItem key={cond} value={cond}>
                  {cond.charAt(0) + cond.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Transmission</Label>
          <Select value={transmission} onValueChange={setTransmission}>
            <SelectTrigger>
              <SelectValue placeholder="All Transmissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transmissions</SelectItem>
              {TRANSMISSIONS.map((trans) => (
                <SelectItem key={trans} value={trans}>
                  {trans.charAt(0) + trans.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fuel Type</Label>
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger>
              <SelectValue placeholder="All Fuel Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuel Types</SelectItem>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel} value={fuel}>
                  {fuel.charAt(0) + fuel.slice(1).toLowerCase().replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  )
}