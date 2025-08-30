'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { useFeaturedCars, useCars } from '@/lib/hooks/use-cars'
import { formatPrice } from '@/lib/utils/price'
import type { Car } from '@/lib/types/car'

interface VehicleShowcaseProps {
  onViewAll?: () => void
  onVehicleClick?: (id: string) => void
  onBookmark?: (id: string) => void
  initialData?: {
    featuredCars: Car[]
    recentCars: Car[]
    popularCars: Car[]
  }
}

export function VehicleShowcase({ onViewAll, onVehicleClick, onBookmark, initialData }: VehicleShowcaseProps) {
  const [activeTab, setActiveTab] = useState('Recent Cars')

  const tabs = ['Recent Cars', 'Featured Cars', 'Popular Cars']

  // Use initial data if available, otherwise fetch from API
  const shouldSkipFetch = !!initialData
  
  const { featuredCars: apiFeaturedCars, loading: featuredLoading, error: featuredError } = useFeaturedCars(shouldSkipFetch ? 0 : 8)
  const { cars: apiRecentCars, loading: recentLoading, error: recentError } = useCars(shouldSkipFetch ? { limit: 0 } : { 
    limit: 8, 
    sortBy: 'newest' 
  })
  const { cars: apiPopularCars, loading: popularLoading, error: popularError } = useCars(shouldSkipFetch ? { limit: 0 } : { 
    limit: 8, 
    sortBy: 'price_desc' // Using high price as popularity proxy
  })

  // Use initial data if available, otherwise use API data
  const featuredCars = initialData?.featuredCars || apiFeaturedCars
  const recentCars = initialData?.recentCars || apiRecentCars
  const popularCars = initialData?.popularCars || apiPopularCars

  // Convert Car to VehicleCard format
  const convertCarToVehicleCard = (car: Car) => ({
    id: car.id,
    title: `${car.year} ${car.make} ${car.model}`,
    description: car.description.substring(0, 60) + '...',
    image: car.images?.[0]?.url || '/images/placeholder-car.jpg',
    price: formatPrice(car.price),
    mileage: car.mileage ? `${car.mileage.toLocaleString()} Miles` : 'New',
    fuelType: car.fuelType.charAt(0) + car.fuelType.slice(1).toLowerCase(),
    transmission: car.transmissionType,
    year: car.year.toString(),
    badge: car.featured ? { text: 'Featured', color: 'blue' as const } : 
           car.condition === 'NEW' ? { text: 'New', color: 'green' as const } :
           car.mileage && car.mileage < 1000 ? { text: 'Low Mileage', color: 'blue' as const } : 
           undefined,
  })

  // Get current vehicles based on active tab
  const getCurrentVehicles = () => {
    switch (activeTab) {
      case 'Featured Cars':
        return featuredCars.map(convertCarToVehicleCard)
      case 'Popular Cars':
        return popularCars.map(convertCarToVehicleCard)
      case 'Recent Cars':
      default:
        return recentCars.map(convertCarToVehicleCard)
    }
  }

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'Featured Cars':
        return featuredLoading
      case 'Popular Cars':
        return popularLoading
      case 'Recent Cars':
      default:
        return recentLoading
    }
  }

  const getCurrentError = () => {
    switch (activeTab) {
      case 'Featured Cars':
        return featuredError
      case 'Popular Cars':
        return popularError
      case 'Recent Cars':
      default:
        return recentError
    }
  }

  const vehicles = getCurrentVehicles()
  const loading = getCurrentLoading()
  const error = getCurrentError()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[40px] font-bold text-[#050B20] leading-[40px]">
            Explore All Vehicles
          </h2>
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-[#050B20] hover:text-[#050B20]/80 p-0 h-auto font-medium text-[15px] group"
          >
            View All
            <ArrowUpRight className="w-[14px] h-[14px] ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E9E9E9] mb-12">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 relative ${
                  activeTab === tab
                    ? 'text-[#050B20] font-medium'
                    : 'text-[#050B20] font-normal hover:text-[#050B20]/80'
                } text-[16px] leading-[29.6px] transition-colors`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#405FF2]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-full max-w-[320px] animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="text-red-600 text-lg font-medium mb-2">
                Failed to load vehicles
              </div>
              <div className="text-gray-600 text-sm mb-4">
                {error}
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  switch (activeTab) {
                    case 'Featured Cars':
                      // Trigger refetch for featured cars
                      break;
                    case 'Popular Cars':
                      // Trigger refetch for popular cars
                      break;
                    default:
                      // Trigger refetch for recent cars
                      break;
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          ) : vehicles.length === 0 ? (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="text-gray-600 text-lg font-medium mb-2">
                No vehicles found
              </div>
              <div className="text-gray-500 text-sm">
                Check back later for new listings
              </div>
            </div>
          ) : (
            // Render vehicles
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                title={vehicle.title}
                description={vehicle.description}
                image={vehicle.image}
                price={vehicle.price}
                mileage={vehicle.mileage}
                fuelType={vehicle.fuelType}
                transmission={vehicle.transmission}
                year={vehicle.year}
                badge={vehicle.badge}
                onViewDetails={onVehicleClick}
                onBookmark={onBookmark}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}